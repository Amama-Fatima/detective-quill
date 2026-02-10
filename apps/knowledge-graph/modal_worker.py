import modal
import os

# ─────────────────────────────────────────────
# Modal App Definition
# ─────────────────────────────────────────────

app = modal.App("detective-quill-knowledge-graph")

# ─────────────────────────────────────────────
# Container Image
# All dependencies your pipeline needs
# ─────────────────────────────────────────────

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install([
        # Core
        "torch==2.1.0",
        "transformers==4.36.0",
        "accelerate==0.25.0",
        "sentencepiece",
        # spaCy
        "spacy==3.7.2",
        # RabbitMQ
        "pika==1.3.2",
        # Config + validation
        "pydantic==2.5.0",
        "pydantic-settings==2.1.0",
    ])
    .run_commands(
        # Download spaCy model into the image at build time
        "python -m spacy download en_core_web_sm"
    )
)

# ─────────────────────────────────────────────
# Modal Secrets
# These map to your .env variables
# Set these in Modal dashboard:
# modal secret create detective-quill-secrets
# ─────────────────────────────────────────────

secrets = [
    modal.Secret.from_name("detective-quill-secrets")
]

# ─────────────────────────────────────────────
# The Worker Class
# ─────────────────────────────────────────────

@app.cls(
    image=image,
    gpu="T4",
    secrets=secrets,
    container_idle_timeout=300,  # container stays warm for 5 mins after last job
    timeout=1200,                # max 20 mins per job (your pipeline ~10 mins)
)
class KnowledgeGraphWorker:

    @modal.enter()
    def load_models(self):
        """
        Runs ONCE when container starts.
        Model stays in memory for all subsequent jobs.
        Equivalent to your singleton pattern in LLMModelLoader.
        """
        import sys
        sys.path.insert(0, "/root/knowledge-graph")

        from src.utils.logger import setup_logger
        self.logger = setup_logger(__name__)

        self.logger.info("Container started - loading models...")

        # Load spaCy (fast, ~1 second)
        import spacy
        self.logger.info("Loading spaCy model...")
        self.nlp = spacy.load("en_core_web_sm")
        self.logger.info("spaCy loaded")

        # Load LLM (slow, ~3-5 minutes on first cold start)
        self.logger.info("Loading OpenHermes LLM - this takes a few minutes...")
        from src.models.llm_loader import get_llm_loader
        self.llm_loader = get_llm_loader()
        self.logger.info("LLM loaded and ready")

        # Load pipeline
        from src.pipeline.orchestrator import NarrativeAnalysisPipeline
        self.pipeline = NarrativeAnalysisPipeline()
        self.logger.info("Pipeline ready")


    @modal.method()
    def process_job(self, job_id: str, scene_text: str, user_id: str) -> dict:
        """
        Runs the full 4-layer pipeline for one job.
        Called by the scheduler below.
        """
        import time
        from src.models.schemas import PipelineResult

        self.logger.info(f"Processing job {job_id}")
        self.logger.info(f"Scene length: {len(scene_text)} characters")

        start_time = time.time()

        try:
            result: PipelineResult = self.pipeline.process_scene(
                scene_text=scene_text
            )

            elapsed = time.time() - start_time
            self.logger.info(f"Job {job_id} completed in {elapsed:.2f}s")

            return {
                "job_id": job_id,
                "status": "completed",
                "result": result.model_dump(),
                "error": None,
                "processing_time": f"{elapsed:.2f}s"
            }

        except Exception as e:
            elapsed = time.time() - start_time
            self.logger.error(f"Job {job_id} failed after {elapsed:.2f}s: {e}")

            return {
                "job_id": job_id,
                "status": "failed",
                "result": None,
                "error": str(e),
                "processing_time": f"{elapsed:.2f}s"
            }


# ─────────────────────────────────────────────
# Scheduled Queue Poller
# Runs every 60 seconds, checks CloudAMQP
# ─────────────────────────────────────────────

@app.function(
    image=image,
    secrets=secrets,
    schedule=modal.Period(seconds=60),
    timeout=1200,
)
def poll_queue():
    """
    Runs every 60 seconds.
    Pulls ONE job from CloudAMQP.
    Hands it to KnowledgeGraphWorker.
    Publishes result back to results queue.
    """
    import pika
    import json
    import os

    from src.utils.logger import setup_logger
    logger = setup_logger(__name__)

    # ── Connect to CloudAMQP ──────────────────
    rabbitmq_url = os.environ["CLOUDAMQP_URL"]
    # CLOUDAMQP_URL looks like:
    # amqps://user:password@host/vhost

    logger.info("Connecting to CloudAMQP...")

    params = pika.URLParameters(rabbitmq_url)
    params.heartbeat = 60
    params.blocked_connection_timeout = 30

    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    # Declare queues (idempotent - safe to call every time)
    channel.queue_declare(queue="scene_analysis_queue", durable=True)
    channel.queue_declare(queue="scene_analysis_results_queue", durable=True)

    # ── Pull ONE message ──────────────────────
    method_frame, properties, body = channel.basic_get(
        queue="scene_analysis_queue",
        auto_ack=False
    )

    if method_frame is None:
        # Queue is empty, nothing to do
        logger.info("Queue is empty. Nothing to process.")
        connection.close()
        return

    # ── Parse message ─────────────────────────
    try:
        message = json.loads(body.decode("utf-8"))
        job_id = message["job_id"]
        scene_text = message["scene_text"]
        user_id = message.get("user_id", "")

        logger.info(f"Picked up job {job_id} from queue")

    except (json.JSONDecodeError, KeyError) as e:
        logger.error(f"Invalid message format: {e}")
        # Reject and discard malformed message
        channel.basic_nack(
            delivery_tag=method_frame.delivery_tag,
            requeue=False
        )
        connection.close()
        return

    # ── Run pipeline on GPU ───────────────────
    worker = KnowledgeGraphWorker()
    output = worker.process_job.remote(
        job_id=job_id,
        scene_text=scene_text,
        user_id=user_id
    )

    # ── Publish result back to CloudAMQP ──────
    channel.basic_publish(
        exchange="",
        routing_key="scene_analysis_results_queue",
        body=json.dumps(output),
        properties=pika.BasicProperties(
            delivery_mode=2,       # persistent message
            content_type="application/json"
        )
    )

    logger.info(f"Published result for job {job_id} to results queue")

    # ── Acknowledge original message ──────────
    channel.basic_ack(delivery_tag=method_frame.delivery_tag)

    connection.close()
    logger.info(f"Done. Job {job_id} status: {output['status']}")