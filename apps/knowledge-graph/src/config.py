import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # RABBITMQ_HOST: str = os.environ.get("RABBITMQ_HOST", "localhost")
    # RABBITMQ_PORT: int = int(os.environ.get("RABBITMQ_PORT", "5672"))
    # RABBITMQ_USER: str = os.environ.get("RABBITMQ_USER", "guest")
    # RABBITMQ_PASSWORD: str = os.environ.get("RABBITMQ_PASSWORD", "guest")
    # RABBITMQ_VHOST: str = os.environ.get("RABBITMQ_VHOST", "/")
    RABBITMQ_HEARTBEAT: int = int(os.environ.get("RABBITMQ_HEARTBEAT", "60"))
    RABBITMQ_BLOCKED_CONNECTION_TIMEOUT: int = int(
        os.environ.get("RABBITMQ_BLOCKED_CONNECTION_TIMEOUT", "30")
    )

    SCENE_ANALYSIS_QUEUE: str = os.environ.get("SCENE_ANALYSIS_QUEUE", "scene_analysis_queue")
    SCENE_ANALYSIS_RESULTS_QUEUE: str = os.environ.get("SCENE_ANALYSIS_RESULTS_QUEUE", "scene_analysis_results_queue")
    CLOUDAMQP_URL: Optional[str] = os.environ.get(
        "CLOUDAMQP_URL", os.environ.get("RABBITMQ_URL", None)
    )

    RABBITMQ_PREFETCH_COUNT: int = int(os.environ.get("RABBITMQ_PREFETCH_COUNT", "1"))

    QUEUE_POLL_INTERVAL_SECONDS: int = max(
        1, int(os.environ.get("QUEUE_POLL_INTERVAL_SECONDS", "120"))
    )
    MAX_JOBS_PER_POLL: int = max(1, int(os.environ.get("MAX_JOBS_PER_POLL", "5")))

    MODEL_NAME: str = os.environ.get("MODEL_NAME", "teknium/OpenHermes-2.5-Mistral-7B")
    MODEL_DEVICE: str = os.environ.get("MODEL_DEVICE", "cuda")
    MODEL_MAX_LENGTH: int = int(os.environ.get("MODEL_MAX_LENGTH", "2048"))
    MODEL_TEMPERATURE: float = float(os.environ.get("MODEL_TEMPERATURE", "0.1"))

    SPACY_MODEL: str = os.environ.get("SPACY_MODEL", "en_core_web_lg")

    FILTERED_ENTITY_TYPES: list = os.environ.get(
        "FILTERED_ENTITY_TYPES", "TIME,DATE,CARDINAL,MONEY,PERCENT"
    ).split(",")

    # API_HOST: str = os.environ.get("API_HOST", "0.0.0.0")
    # API_PORT: int = int(os.environ.get("API_PORT", "8000"))

    LOG_LEVEL: str = os.environ.get("LOG_LEVEL", "INFO")

    NEO4J_URI: Optional[str] = os.environ.get("NEO4J_URI", None)
    NEO4J_USERNAME: Optional[str] = os.environ.get("NEO4J_USER", None)
    NEO4J_PASSWORD: Optional[str] = os.environ.get("NEO4J_PASSWORD", None)


settings = Settings()