from __future__ import annotations

import asyncio
import json
import urllib.error
import urllib.request
from dataclasses import dataclass

from app.core.config import settings
from app.core.logging import get_logger
from app.core.supabase import get_supabase_client
from app.schemas.query import AnswerGenerationResult, QueryResponse, SupportingEvidence
from app.services.modal_llm import ModalQwenLLM

logger = get_logger(__name__)


@dataclass
class VectorChunk:
    id: str
    fs_node_id: str | None
    path: str | None
    chunk_index: int | None
    chunk_text: str | None
    similarity: float | None = None


class VectorRAGService:
    def __init__(self) -> None:
        self._llm = ModalQwenLLM(
            timeout_seconds=settings.modal_timeout_seconds,
            app_name=settings.vector_answer_modal_app_name,
            model_class_name=settings.vector_answer_modal_model_class_name,
        )
        self._embedding_api_url = settings.embedding_api_url
        self._embedding_api_key = settings.embedding_api_key
        self._embedding_auth_header = settings.embedding_auth_header
        self._embedding_auth_scheme = settings.embedding_auth_scheme
        self._embedding_model = settings.embedding_model
        self._embedding_dimensions = settings.embedding_dimensions
        self._match_count = settings.vector_match_count

    @staticmethod
    def _extract_json_payload(output: str) -> dict:
        stripped = output.strip()
        if stripped.startswith("```"):
            lines = [line for line in stripped.splitlines() if not line.startswith("```")]
            stripped = "\n".join(lines).strip()

        try:
            payload = json.loads(stripped)
            if isinstance(payload, dict):
                return payload
        except json.JSONDecodeError:
            pass

        candidate = VectorRAGService._extract_first_json_object(stripped)
        if not candidate:
            return {}

        try:
            payload = json.loads(candidate)
            return payload if isinstance(payload, dict) else {}
        except json.JSONDecodeError:
            return {}

    @staticmethod
    def _extract_first_json_object(text: str) -> str:
        start = text.find("{")
        if start == -1:
            return ""

        depth = 0
        in_string = False
        escaped = False

        for index in range(start, len(text)):
            char = text[index]
            if in_string:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == '"':
                    in_string = False
                continue

            if char == '"':
                in_string = True
            elif char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    return text[start : index + 1]

        return ""

    @staticmethod
    def _normalize_string_list(raw_values: object) -> list[str]:
        if not isinstance(raw_values, list):
            return []

        seen: set[str] = set()
        normalized: list[str] = []
        for item in raw_values:
            if item is None:
                continue
            value = str(item).strip()
            if not value or value in seen:
                continue
            seen.add(value)
            normalized.append(value)

        return normalized

    def _build_context_text(self, chunks: list[VectorChunk]) -> str:
        if not chunks:
            return "No relevant context was found."

        lines: list[str] = []
        for index, chunk in enumerate(chunks, start=1):
            lines.append(
                f"Chunk {index} [chunk_id={chunk.id}] [fs_node_id={chunk.fs_node_id}] [path={chunk.path}] [similarity={chunk.similarity}]:\n{chunk.chunk_text or ''}"
            )
        return "\n\n".join(lines)

    def _build_prompt(self, question: str, chunks: list[VectorChunk]) -> str:
        context_text = self._build_context_text(chunks)
        return f"""You are an expert assistant answering questions from retrieved story excerpts.

Use only the provided context. If the context is not sufficient, say so clearly.
Return a JSON object with this exact shape:
{{"answer": "<string>", "supporting_job_ids": ["<chunk_id_1>", "<chunk_id_2>"]}}

Rules:
1. Answer in one to three sentences.
2. Do not invent details that are not in the context.
3. Include only chunk IDs that directly support the answer.
4. If nothing supports the answer, return an empty supporting_job_ids list.
5. Stop immediately after the JSON object. Do not write another prompt, example, explanation, or markdown.

USER QUESTION:
{question}

CONTEXT:
{context_text}

JSON RESPONSE:"""

    async def _generate_embedding(self, question: str) -> list[float]:
        if not self._embedding_api_url:
            raise RuntimeError("EMBEDDING_API_URL is required for vector queries.")

        request_body: dict[str, object] = {
            "input": question,
            "input_type": "query",
        }
        if self._embedding_model:
            request_body["model"] = self._embedding_model

        payload = json.dumps(request_body).encode("utf-8")

        def _call_embedding_api() -> list[float]:
            headers = {"Content-Type": "application/json"}
            if self._embedding_api_key:
                headers[self._embedding_auth_header] = (
                    self._embedding_api_key
                    if self._embedding_auth_scheme == ""
                    else f"{self._embedding_auth_scheme} {self._embedding_api_key}"
                )

            request = urllib.request.Request(
                self._embedding_api_url,
                data=payload,
                method="POST",
                headers=headers,
            )

            try:
                with urllib.request.urlopen(request, timeout=60) as response:
                    body = response.read().decode("utf-8")
            except urllib.error.HTTPError as exc:
                body = exc.read().decode("utf-8", errors="ignore")
                raise RuntimeError(
                    f"Embedding API failed with status {exc.code}: {body[:500]}"
                ) from exc
            except urllib.error.URLError as exc:
                raise RuntimeError(f"Embedding API request failed: {exc.reason}") from exc

            data = json.loads(body)
            embedding = None
            if isinstance(data.get("data"), list) and data["data"]:
                embedding = data["data"][0].get("embedding")
            elif isinstance(data.get("embeddings"), list) and data["embeddings"]:
                embedding = data["embeddings"][0]

            if not isinstance(embedding, list) or not embedding:
                raise RuntimeError("Embedding API returned an invalid payload")

            if len(embedding) != self._embedding_dimensions:
                logger.warning(
                    "Embedding dimension mismatch: expected %s, got %s",
                    self._embedding_dimensions,
                    len(embedding),
                )

            return [float(value) for value in embedding]

        return await asyncio.to_thread(_call_embedding_api)

    async def _generate_answer(self, prompt: str) -> str:
        return self._llm.generate(prompt)

    def _fetch_chunks(
        self,
        project_id: str,
        fs_node_id: str,
        query_embedding: list[float],
    ) -> list[VectorChunk]:
        client = get_supabase_client()
        response = client.rpc(
            "match_story_chunks",
            {
                "query_embedding": query_embedding,
                "match_count": self._match_count,
                "filter_project_id": project_id,
                "filter_fs_node_id": fs_node_id,
                "filter_commit_id": None,
            },
        ).execute()

        rows = response.data or []
        chunks: list[VectorChunk] = []

        for row in rows:
            if row.get("fs_node_id") is None:
                continue

            chunks.append(
                VectorChunk(
                    id=str(row.get("id")),
                    fs_node_id=str(row.get("fs_node_id")) if row.get("fs_node_id") is not None else None,
                    path=str(row.get("path")) if row.get("path") is not None else None,
                    chunk_index=int(row.get("chunk_index")) if row.get("chunk_index") is not None else None,
                    chunk_text=str(row.get("chunk_text")) if row.get("chunk_text") is not None else None,
                    similarity=float(row.get("similarity")) if row.get("similarity") is not None else None,
                )
            )

        return chunks

    def _build_supporting_evidence(
        self, chunks: list[VectorChunk]
    ) -> list[SupportingEvidence]:
        if not chunks:
            return []

        client = get_supabase_client()
        fs_node_ids = []
        seen_fs_node_ids: set[str] = set()
        for chunk in chunks:
            if not chunk.fs_node_id or chunk.fs_node_id in seen_fs_node_ids:
                continue
            seen_fs_node_ids.add(chunk.fs_node_id)
            fs_node_ids.append(chunk.fs_node_id)

        fs_node_names_by_id: dict[str, str] = {}
        if fs_node_ids:
            fs_nodes_response = (
                client.table("fs_nodes")
                .select("id,name")
                .in_("id", fs_node_ids)
                .execute()
            )
            fs_nodes_rows = fs_nodes_response.data or []
            fs_node_names_by_id = {
                str(row.get("id")): str(row.get("name"))
                for row in fs_nodes_rows
                if row.get("id") is not None and row.get("name") is not None
            }

        evidence: list[SupportingEvidence] = []
        seen_source_ids: set[str] = set()
        for chunk in chunks:
            if chunk.fs_node_id and chunk.fs_node_id in seen_source_ids:
                continue
            if chunk.fs_node_id:
                seen_source_ids.add(chunk.fs_node_id)
            evidence.append(
                SupportingEvidence(
                    job_id=chunk.id,
                    fs_node_id=chunk.fs_node_id,
                    fs_node_name=(
                        fs_node_names_by_id.get(chunk.fs_node_id)
                        if chunk.fs_node_id
                        else None
                    ),
                    resolved_text=chunk.chunk_text,
                )
            )

        return evidence

    def _parse_answer_output(
        self,
        output: str,
        chunks: list[VectorChunk],
    ) -> AnswerGenerationResult:
        payload = self._extract_json_payload(output)
        answer = str(payload.get("answer", "")).strip() if payload else ""
        supporting_job_ids = self._normalize_string_list(
            payload.get("supporting_job_ids") if payload else []
        )

        available_chunk_ids = {chunk.id for chunk in chunks}
        supporting_job_ids = [
            chunk_id for chunk_id in supporting_job_ids if chunk_id in available_chunk_ids
        ]

        if answer:
            return AnswerGenerationResult(
                answer=answer,
                supporting_job_ids=supporting_job_ids,
            )

        return AnswerGenerationResult(
            answer=output.strip(),
            supporting_job_ids=supporting_job_ids,
        )

    async def query(
        self,
        question: str,
        project_id: str,
        fs_node_id: str,
    ) -> QueryResponse:
        logger.info("Generating vector answer for question")

        query_embedding = await self._generate_embedding(question)
        chunks = self._fetch_chunks(project_id, fs_node_id, query_embedding)

        if not chunks:
            return QueryResponse(
                status="ok",
                question=question,
                answer="This information is not available in the current context.",
                supporting_ids_and_text=[],
                entities=[],
                relationships=[],
            )

        prompt = self._build_prompt(question, chunks)
        output = await self._generate_answer(prompt)
        result = self._parse_answer_output(output, chunks)

        available_chunks_by_id = {chunk.id: chunk for chunk in chunks}
        supporting_chunks = [
            available_chunks_by_id[chunk_id]
            for chunk_id in result.supporting_job_ids
            if chunk_id in available_chunks_by_id
        ]
        supporting_evidence = self._build_supporting_evidence(supporting_chunks)

        return QueryResponse(
            status="ok",
            question=question,
            answer=result.answer,
            supporting_ids_and_text=supporting_evidence,
            entities=[],
            relationships=[],
        )


vector_rag_service = VectorRAGService()
