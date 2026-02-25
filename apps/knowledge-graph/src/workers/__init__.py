"""Workers package for background job processing."""

from src.workers.rabbitmq_consumer import RabbitMQWorker, main

__all__ = [
    "RabbitMQWorker",
    "main",
]