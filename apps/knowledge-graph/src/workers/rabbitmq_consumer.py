import json
import pika
import time
from typing import Optional

from src.models.schemas import SceneAnalysisRequest, SceneAnalysisResponse, PipelineResult
from src.pipeline.orchestrator import NarrativeAnalysisPipeline
from src.config import settings
from src.utils.logger import setup_logger


logger = setup_logger(__name__)

class RabbitMQWorker:
    def __init__(self):
        self.connection: Optional[pika.BlockingConnection] = None
        self.channel: Optional[pika.channel.Channel] = None
        self.pipeline = NarrativeAnalysisPipeline()

        logger.info("RabbitMQWorker initialized")


    def connect(self):
        logger.info(f"Connecting to RabbitMQ at {settings.RABBITMQ_HOST}:{settings.RABBITMQ_PORT}...")

        try:
            credentials = pika.PlainCredentials(
                settings.RABBITMQ_USER,
                settings.RABBITMQ_PASSWORD
            )

            parameters = pika.ConnectionParameters(
                host=settings.RABBITMQ_HOST,
                port=settings.RABBITMQ_PORT,
                virtual_host=settings.RABBITMQ_VHOST,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300
            )

            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()

            self.channel.queue_declare(
                queue=settings.SCENE_ANALYSIS_QUEUE,
                durable=True
            )

            self.channel.queue_declare(
                queue=settings.SCENE_ANALYSIS_RESULTS_QUEUE,
                durable=True
            )

            self.channel.basic_qos(prefetch_count=settings.RABBITMQ_PREFETCH_COUNT)

            logger.info("Connected to RabbitMQ successfully")
            logger.info(f"✓ Input queue: {settings.SCENE_ANALYSIS_QUEUE}")
            logger.info(f"✓ Output queue: {settings.SCENE_ANALYSIS_RESULTS_QUEUE}")

        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            raise e
        
    
    def process_message(
        self,
        ch: pika.channel.Channel,
        method: pika.spec.Basic.Deliver,
        properties: pika.spec.BasicProperties,
        body: bytes
    ):
        job_id = None

        try:
            message_str = body.decode('utf-8')
            logger.info("=" * 60)
            logger.info("NEW JOB RECEIVED")
            logger.info("=" * 60)
            logger.debug(f"Message: {message_str[:200]}")

            message_data = json.loads(message_str)
            request = SceneAnalysisRequest(**message_data)
            job_id = request.job_id
            logger.info(f"Job ID: {job_id}")
            logger.info(f"User ID: {request.user_id}")
            logger.info(f"Scene length: {len(request.scene_text)} characters")

            start_time = time.time()
            logger.info("Starting narrative analysis pipeline...")
                        
            result: PipelineResult = self.pipeline.process_scene(
                scene_text=request.scene_text
            )
            

            elapsed_time = time.time() - start_time
            logger.info(f"Pipeline completed in {elapsed_time:.2f} seconds")

            response = SceneAnalysisResponse(
                job_id=job_id,
                status="completed",
                result=result,
                error=None
            )

            self._publish_result(response)
            
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
            logger.info("=" * 60)
            logger.info(f"JOB {job_id} COMPLETED SUCCESSFULLY")
            logger.info("=" * 60)

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in message: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


        except Exception as e:
            logger.error(f"Error processing job {job_id}: {e}", exc_info=True)
            
            if job_id:
                response = SceneAnalysisResponse(
                    job_id=job_id,
                    status="failed",
                    result=None,
                    error=str(e)
                )
                
                try:
                    self._publish_result(response)
                except Exception as publish_error:
                    logger.error(f"Failed to publish error response: {publish_error}")
            
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
            logger.error("=" * 60)
            logger.error(f"JOB {job_id} FAILED")
            logger.error("=" * 60)


    def _publish_result(self, response: SceneAnalysisResponse):
        try:
            message_body = response.model_dump_json()

            self.channel.basic_publish(
                exchange='',
                routing_key=settings.SCENE_ANALYSIS_RESULTS_QUEUE,
                body=message_body,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Make message persistent
                    content_type='application/json'
                )
            )

            logger.info(f"✓ Published result for job {response.job_id} to {settings.SCENE_ANALYSIS_RESULTS_QUEUE}")

        except Exception as e:
            logger.error(f"Failed to publish result: {e}")
            raise
    
    def start(self):
        
        logger.info("=" * 60)
        logger.info("RABBITMQ WORKER STARTING")
        logger.info("=" * 60)
        
        self.connect()
        
        logger.info(f"Waiting for messages on queue: {settings.SCENE_ANALYSIS_QUEUE}")
        logger.info("Press CTRL+C to exit")
        logger.info("=" * 60)
        
        try:
            self.channel.basic_consume(
                queue=settings.SCENE_ANALYSIS_QUEUE,
                on_message_callback=self.process_message,
                auto_ack=False 
            )
            
            self.channel.start_consuming()
            
        except KeyboardInterrupt:
            logger.info("\nReceived interrupt signal, shutting down...")
            self.stop()
        except Exception as e:
            logger.error(f"Error in consumer: {e}")
            self.stop()
            raise

    
    def stop(self):
        logger.info("Stopping worker...")
        
        try:
            if self.channel:
                self.channel.stop_consuming()
                logger.info("Stopped consuming messages")
            
            if self.connection:
                self.connection.close()
                logger.info("Closed RabbitMQ connection")
        
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")
        
        logger.info("Worker stopped")

def main():
    """
    Main entry point for the RabbitMQ worker.
    
    This function is called when running the worker directly.
    """
    worker = RabbitMQWorker()
    worker.start()


if __name__ == "__main__":
    main()