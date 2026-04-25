from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Detective Quill Query Engine"
    api_v1_prefix: str = "version1"
    log_level: str = "INFO"
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = ""
    neo4j_password: str = ""
    llm_model: str = "Qwen2.5-7B-Instruct"
    llm_api_base: str = ""
    llm_api_key: str = ""
    llm_temperature: float = 0.0
    graph_top_k: int = 30
    cypher_result_limit: int = 20
    modal_timeout_seconds: int = 30
    use_modal_nl2cypher: bool = True
    modal_app_name: str = "detective-quill-nl2cypher"
    modal_model_class_name: str = "NL2CypherModel"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()


# Qwen2.5-1.5B-Instruct