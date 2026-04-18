import modal
import os
import pika
import json


from src.utils.logger import setup_logger
from .knowledge_graph_worker import KnowledgeGraphWorker
from .modal_app import app, image, secrets, POLL_INTERVAL_SECONDS, MAX_JOBS_PER_POLL


# this decorator makes the model trigger this function periodically based on the schedule defined
@app.function(
    image=image,
    secrets=secrets,
    schedule=modal.Period(seconds=POLL_INTERVAL_SECONDS),
    timeout=1800,
)
def poll_queue():

    logger = setup_logger(__name__)

    rabbitmq_url = os.environ["CLOUDAMQP_URL"]

    logger.info("Connecting to CloudAMQP...")
    params = pika.URLParameters(rabbitmq_url)
    params.heartbeat = 60
    params.blocked_connection_timeout = 30

    connection = None

    try:
        connection = pika.BlockingConnection(params) #this actually establishes the connection to RabbitMQ
        logger.info("Connected to CloudAMQP")
        channel = connection.channel()

        channel.queue_declare(queue="scene_analysis_queue", durable=True)
        channel.queue_declare(queue="scene_analysis_results_queue", durable=True)

        worker = KnowledgeGraphWorker()
        processed = 0

        while processed < MAX_JOBS_PER_POLL:
            method_frame, properties, body = channel.basic_get(
                queue="scene_analysis_queue",
                auto_ack=False
            )

            if method_frame is None:
                if processed == 0:
                    logger.info("Queue is empty. Nothing to process.")
                break

            delivery_tag = method_frame.delivery_tag

            try:
                raw_message = json.loads(body.decode("utf-8"))

# todo: check if this check of pattern and data is really needed or we can just assume the message is in the expected format.
                if "pattern" in raw_message and "data" in raw_message:
                    message = raw_message["data"]
                else:
                    message = raw_message

                job_id = message["job_id"]
                scene_text = message["scene_text"]
                user_id = message.get("user_id", "")
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Invalid message format: {e}")
                channel.basic_nack(delivery_tag=delivery_tag, requeue=False)
                continue

            logger.info(f"Picked up job {job_id} from queue")

            try:
                output = worker.process_job.remote(
                    job_id=job_id,
                    scene_text=scene_text,
                    user_id=user_id
                )

                channel.basic_publish(
                    exchange="",
                    routing_key="scene_analysis_results_queue",
                    body=json.dumps(output),
                    properties=pika.BasicProperties(
                        delivery_mode=2,
                        content_type="application/json"
                    )
                )

                channel.basic_ack(delivery_tag=delivery_tag)
                processed += 1
                logger.info(f"Published result for job {job_id} to results queue")
                logger.info(f"Done. Job {job_id} status: {output['status']}")
            except Exception as e:
                logger.error(f"Failed processing/publishing for job {job_id}: {e}", exc_info=True)
                channel.basic_nack(delivery_tag=delivery_tag, requeue=True)

        if processed > 0:
            logger.info(f"Processed {processed} job(s) in this polling cycle")
    finally:
        if connection and connection.is_open:
            connection.close()