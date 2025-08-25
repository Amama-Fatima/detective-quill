from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # FastAPI settings
    app_name: str = "ML Service"
    debug: bool = True
    
    # Supabase settings
    supabase_url: str
    supabase_key: str  # Service role key for server-side access
    
    # RabbitMQ settings
    rabbitmq_url: str = "amqp://admin:password@localhost:5672/"
    queue_name: str = "embedding_jobs"
    
    # Vector DB settings (we'll add Pinecone/Qdrant later)
    vector_db_type: str = "pinecone"  # or "qdrant"
    
    class Config:
        env_file = ".env"

# Global settings instance
settings = Settings()