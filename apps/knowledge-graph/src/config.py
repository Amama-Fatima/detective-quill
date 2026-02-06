from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASSWORD: str = "guest"
    RABBITMQ_VHOST: str = "/"

    SCENE_ANALYSIS_QUEUE: str = "scene_analysis_queue"
    SCENE_ANALYSIS_RESULTS_QUEUE: str = "scene_analysis_results_queue"

    RABBITMQ_PREFETCH_COUNT: int = 1

    MODEL_NAME: str = "teknium/OpenHermes-2.5-Mistral-7B"
    MODEL_DEVICE: str = "cuda"
    MODEL_MAX_LENGTH: int = 2048
    MODEL_TEMPERATURE: float = 0.1

    SPACY_MODEL: str = "en_core_web_sm"

    FILTERED_ENTITY_TYPES: list[str] = [
        "TIME", 
        "DATE", 
        "CARDINAL", 
        "MONEY", 
        "PERCENT"
    ]

    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    LOG_LEVEL: str = "INFO"

    NEO4J_URI: Optional[str] = None
    NEO4J_USER: Optional[str] = None
    NEO4J_PASSWORD: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()