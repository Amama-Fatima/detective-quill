import os
from typing import Annotated, Optional

import modal
from fastapi import Header

APP_NAME = "detective-quill-embeddings"
MODEL_ID = "BAAI/bge-small-en-v1.5"
EMBEDDING_DIMENSIONS = 384
BGE_QUERY_PREFIX = "Represent this sentence for searching relevant passages: "

volume = modal.Volume.from_name("embedding-model-cache", create_if_missing=True)

image = modal.Image.debian_slim(python_version="3.10").pip_install(
    "sentence-transformers>=3.0.0,<4.0.0",
    "fastapi[standard]",
)

app = modal.App(APP_NAME)


@app.cls(
    image=image,
    timeout=180,
    scaledown_window=300,
    volumes={"/model_cache": volume},
)
class EmbeddingModel:
    @modal.enter()
    def load(self) -> None:
        from sentence_transformers import SentenceTransformer

        self._model = SentenceTransformer(
            MODEL_ID,
            cache_folder="/model_cache",
        )

    @modal.method()
    def embed(self, inputs: list[str]) -> list[list[float]]:
        embeddings = self._model.encode(
            inputs,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )
        return embeddings.tolist()


embedding_model = EmbeddingModel()


def _normalize_inputs(value: object) -> list[str]:
    if isinstance(value, str):
        return [value]

    if isinstance(value, list) and all(isinstance(item, str) for item in value):
        return value

    raise ValueError("input must be a string or list of strings")


def _prepare_inputs(inputs: list[str], input_type: object) -> list[str]:
    if input_type == "query":
        return [f"{BGE_QUERY_PREFIX}{value}" for value in inputs]

    return inputs


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("detective-quill-embedding-secret")],
)
@modal.fastapi_endpoint(method="POST")
def embeddings(
    payload: dict,
    authorization: Annotated[Optional[str], Header()] = None,
) -> dict:
    api_key = os.environ.get("EMBEDDING_API_KEY")
    if api_key and authorization != f"Bearer {api_key}":
        from fastapi import HTTPException

        raise HTTPException(status_code=401, detail="Invalid embedding API key")

    try:
        inputs = _normalize_inputs(payload.get("input"))
    except ValueError as exc:
        from fastapi import HTTPException

        raise HTTPException(status_code=422, detail=str(exc)) from exc

    inputs = _prepare_inputs(inputs, payload.get("input_type"))

    return {
        "model": MODEL_ID,
        "dimensions": EMBEDDING_DIMENSIONS,
        "embeddings": embedding_model.embed.remote(inputs),
    }


@app.local_entrypoint()
def main(text: str = "Detective found a clue in the locked study.") -> None:
    print(embedding_model.embed.remote([text])[0][:8])
