import modal
import os
import sys

# ─────────────────────────────────────────────
# Modal App Definition
# ─────────────────────────────────────────────

app = modal.App("detective-quill-knowledge-graph")

# ─────────────────────────────────────────────
# Container Image
# ─────────────────────────────────────────────

image = (
    modal.Image.debian_slim(python_version="3.10")
    .pip_install([
        "torch==2.1.0",
        "transformers==4.36.0",
        "accelerate==0.25.0",
        "bitsandbytes>=0.43.0",
        "scipy",
        "sentencepiece",
        "numpy<2.0",
        "pika==1.3.2",
        "spacy==3.5.4",
        "pydantic==1.10.13",
        "supabase==1.2.0", 
        "neo4j==5.14.0",  
    ])
    .pip_install([
        "https://github.com/explosion/spacy-models/releases/download/"
        "en_core_web_lg-3.5.0/en_core_web_lg-3.5.0-py3-none-any.whl"
    ])
    .pip_install(["coreferee==1.4.1"])
    .run_commands("python -m coreferee install en")
    .add_local_dir("src", remote_path="/root/src")
)

# ─────────────────────────────────────────────
# Modal Secrets
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
    scaledown_window=300,
    timeout=1800,
)
class KnowledgeGraphWorker:

    @modal.enter()
    def load_models(self):
        """
        Runs ONCE when container starts.
        src/ is already at /root/src/ via the image mount.
        """
        import sys
        sys.path.insert(0, "/root")  # makes 'from src.xxx import yyy' work

        from src.utils.logger import setup_logger
        self.logger = setup_logger(__name__)
        self.logger.info("Container started - loading models...")

        import spacy
        self.logger.info("Loading spaCy model...")
        self.nlp = spacy.load("en_core_web_lg")
        self.nlp.add_pipe("coreferee")
        self.logger.info("spaCy loaded")

        self.logger.info("Loading OpenHermes LLM - this takes a few minutes...")
        from src.models.llm_loader import get_llm_loader
        self.llm_loader = get_llm_loader()
        self.logger.info("LLM loaded and ready")

        from src.pipeline.orchestrator import NarrativeAnalysisPipeline
        self.pipeline = NarrativeAnalysisPipeline(nlp=self.nlp)
        self.logger.info("Pipeline ready")

    @modal.method()
    def process_job(self, job_id: str, scene_text: str, user_id: str) -> dict:
        import time
        self.logger.info(f"Processing job {job_id}")
        start_time = time.time()

        try:
            result = self.pipeline.process_scene(scene_text=scene_text)

            from src.pipeline.layer5_graph import save_graph_layer5
            save_graph_layer5(
                scene_id=job_id,
                user_id=user_id,
                scene_text=scene_text,
                resolved_text=getattr(result, "resolved_text", scene_text),
                entities=result.entities,
                relationships=result.relationships,
            )

            elapsed = time.time() - start_time
            self.logger.info(f"Job {job_id} completed in {elapsed:.2f}s")

            return {
                "job_id": job_id,
                "status": "completed",
                "result": result.dict(),
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
# ─────────────────────────────────────────────

@app.function(
    image=image,
    secrets=secrets,
    schedule=modal.Period(seconds=60),
    timeout=1800,
)
def poll_queue():
    import pika
    import json
    import os

    from src.utils.logger import setup_logger
    logger = setup_logger(__name__)

    rabbitmq_url = os.environ["CLOUDAMQP_URL"]

    logger.info("Connecting to CloudAMQP...")
    params = pika.URLParameters(rabbitmq_url)
    params.heartbeat = 60
    params.blocked_connection_timeout = 30

    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.queue_declare(queue="scene_analysis_queue", durable=True)
    channel.queue_declare(queue="scene_analysis_results_queue", durable=True)

    method_frame, properties, body = channel.basic_get(
        queue="scene_analysis_queue",
        auto_ack=False
    )

    if method_frame is None:
        logger.info("Queue is empty. Nothing to process.")
        connection.close()
        return

    try:
        raw_message = json.loads(body.decode("utf-8"))
        
        if "pattern" in raw_message and "data" in raw_message:
            message = raw_message["data"]
        else:
            message = raw_message
        
        job_id = message["job_id"]
        scene_text = message["scene_text"]
        user_id = message.get("user_id", "")

        logger.info(f"Picked up job {job_id} from queue")

    except (json.JSONDecodeError, KeyError) as e:
        logger.error(f"Invalid message format: {e}")
        channel.basic_nack(
            delivery_tag=method_frame.delivery_tag,
            requeue=False
        )
        connection.close()
        return

    channel.basic_ack(delivery_tag=method_frame.delivery_tag)
    connection.close()

    worker = KnowledgeGraphWorker()
    output = worker.process_job.remote(
        job_id=job_id,
        scene_text=scene_text,
        user_id=user_id
    )

    logger.info("Reconnecting to CloudAMQP to publish result...")
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue="scene_analysis_results_queue", durable=True)

    channel.basic_publish(
        exchange="",
        routing_key="scene_analysis_results_queue",
        body=json.dumps(output),
        properties=pika.BasicProperties(
            delivery_mode=2,
            content_type="application/json"
        )
    )

    logger.info(f"Published result for job {job_id} to results queue")
    connection.close()
    logger.info(f"Done. Job {job_id} status: {output['status']}")        