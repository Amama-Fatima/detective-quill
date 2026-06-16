from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Detective Quill Query Engine"
    api_v1_prefix: str = "version1"
    log_level: str = "INFO"
    modal_timeout_seconds: int = 100
    vector_answer_modal_app_name: str = "detective-quill-answer"
    vector_answer_modal_model_class_name: str = "AnswerModel"
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    embedding_api_url: str = ""
    embedding_api_key: str = ""
    embedding_auth_header: str = "Authorization"
    embedding_auth_scheme: str = "Bearer"
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    embedding_dimensions: int = 384
    vector_match_count: int = 8
    cors_allow_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()


# Qwen2.5-1.5B-Instruct