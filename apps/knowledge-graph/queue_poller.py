import modal
import json
import time


from src.config import settings
from src.utils.logger import setup_logger
from modal_app import app, image, secrets

import pika
from knowledge_graph_worker import KnowledgeGraphWorker

logger = setup_logger(__name__)


def _build_rabbitmq_params():
    params = pika.URLParameters(settings.CLOUDAMQP_URL)
    # Keep heartbeat high enough for cloud/network jitter.
    params.heartbeat = max(settings.RABBITMQ_HEARTBEAT, 800)
    params.blocked_connection_timeout = settings.RABBITMQ_BLOCKED_CONNECTION_TIMEOUT
    return params


def _publish_result_with_retry(output, max_attempts=3):
    last_error = None

    for attempt in range(1, max_attempts + 1):
        connection = None
        try:
            connection = pika.BlockingConnection(_build_rabbitmq_params())
            channel = connection.channel()
            channel.queue_declare(queue=settings.SCENE_ANALYSIS_RESULTS_QUEUE, durable=True)

            channel.basic_publish(
                exchange="",
                routing_key=settings.SCENE_ANALYSIS_RESULTS_QUEUE,
                body=json.dumps(output),
                properties=pika.BasicProperties(
                    delivery_mode=2,
                    content_type="application/json"
                )
            )
            return
        except Exception as e:
            last_error = e
            logger.error(
                f"Publish attempt {attempt}/{max_attempts} failed: {e}",
                exc_info=True,
            )
            time.sleep(min(2 * attempt, 5))
        finally:
            if connection and connection.is_open:
                connection.close()

    raise RuntimeError(f"Failed to publish result after {max_attempts} attempts: {last_error}")

# this decorator makes the model trigger this function periodically based on the schedule defined
@app.function(
    image=image,
    secrets=secrets,
    schedule=modal.Period(seconds=settings.QUEUE_POLL_INTERVAL_SECONDS),
    timeout=1800,
)
def poll_queue():



    if not settings.CLOUDAMQP_URL:
        raise ValueError("Missing CLOUDAMQP_URL (or RABBITMQ_URL) in environment")

    logger.info("Connecting to CloudAMQP...")

    worker = KnowledgeGraphWorker()
    processed = 0

    while processed < settings.MAX_JOBS_PER_POLL:
        connection = None
        channel = None
        method_frame = None

        try:
            connection = pika.BlockingConnection(_build_rabbitmq_params())
            channel = connection.channel()
            channel.queue_declare(queue=settings.SCENE_ANALYSIS_QUEUE, durable=True)
            channel.queue_declare(queue=settings.SCENE_ANALYSIS_RESULTS_QUEUE, durable=True)

            method_frame, body = channel.basic_get(
                queue=settings.SCENE_ANALYSIS_QUEUE,
                auto_ack=False
            )

            if method_frame is None:
                if processed == 0:
                    logger.info("Queue is empty. Nothing to process.")
                break

            delivery_tag = method_frame.delivery_tag

            # Ack immediately to enforce strict at-most-once semantics
            # (never requeue back to scene_analysis_queue).
            channel.basic_ack(delivery_tag=delivery_tag)

            try:
                raw_message = json.loads(body.decode("utf-8"))

                # Handle both plain payloads and NestJS event wrapper payloads.
                if "pattern" in raw_message and "data" in raw_message:
                    message = raw_message["data"]
                else:
                    message = raw_message

                job_id = message["job_id"]
                scene_text = message["scene_text"]
                user_id = message.get("user_id", "")
                fs_node_id = message.get("fs_node_id", job_id)
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Invalid message format: {e}")
                continue

            logger.info(f"Picked up job {job_id} from queue")
        except Exception as e:
            logger.error(f"Queue read/ack failed: {e}", exc_info=True)
            break
        finally:
            if connection and connection.is_open:
                connection.close()

        try:
            output = worker.process_job.remote(
                job_id=job_id,
                scene_text=scene_text,
                user_id=user_id,
                fs_node_id=fs_node_id,
            )

            _publish_result_with_retry(output)

            processed += 1
            logger.info(f"Published result for job {job_id} to results queue")
            logger.info(f"Done. Job {job_id} status: {output['status']}")
        except Exception as e:
            logger.error(f"Failed processing/publishing for job {job_id}: {e}", exc_info=True)
            # The input message was intentionally acked already.

    if processed > 0:
        logger.info(f"Processed {processed} job(s) in this polling cycle")