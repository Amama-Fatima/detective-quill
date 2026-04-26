import json

from app.core.config import settings
from app.core.logging import get_logger
from app.core.prompts import ANSWER_PROMPT_TEMPLATE
from app.schemas.query import EntityContext, RelationshipContext, AnswerGenerationResult
from app.services.modal_llm import ModalQwenLLM
from app.services.prompt_template import PromptTemplate

logger = get_logger(__name__)


class AnswerGenerationService:
    def __init__(self) -> None:
        self._answer_prompt = PromptTemplate.from_template(ANSWER_PROMPT_TEMPLATE)
        self._llm = ModalQwenLLM(timeout_seconds=settings.modal_timeout_seconds)

    @staticmethod
    def _format_entities(entities: list[EntityContext]) -> str:
        if not entities:
            return "No entities found."

        lines = []
        for entity in entities:
            mention_text = ""
            if entity.mentions:
                mention_text = f" (also mentioned as: {', '.join(entity.mentions)})"
            lines.append(
                f"- [job_id={entity.job_id}] name={entity.name}{mention_text}"
            )

        return "\n".join(lines)

    @staticmethod
    def _format_relationships(
        relationships: list[RelationshipContext],
    ) -> str:
        if not relationships:
            return "No relationships found."

        lines = []
        for rel in relationships:
            lines.append(
                f"- [job_id={rel.job_id}] {rel.source} --[{rel.relation_type}]--> {rel.target}"
            )

        return "\n".join(lines)

    def _build_prompt(
        self,
        question: str,
        entities: list[EntityContext],
        relationships: list[RelationshipContext],
    ) -> str:
        entities_text = self._format_entities(entities)
        relationships_text = self._format_relationships(relationships)

        return self._answer_prompt.format(
            question=question,
            entities_text=entities_text,
            relationships_text=relationships_text,
        )

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

        first_brace = stripped.find("{")
        last_brace = stripped.rfind("}")
        if first_brace == -1 or last_brace == -1 or last_brace <= first_brace:
            return {}

        candidate = stripped[first_brace : last_brace + 1]
        try:
            payload = json.loads(candidate)
            return payload if isinstance(payload, dict) else {}
        except json.JSONDecodeError:
            return {}

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

    @staticmethod
    def _available_job_ids(
        entities: list[EntityContext], relationships: list[RelationshipContext]
    ) -> set[str]:
        available: set[str] = set()
        for entity in entities:
            if entity.job_id:
                available.add(entity.job_id)
        for relationship in relationships:
            if relationship.job_id:
                available.add(relationship.job_id)
        return available

    def _parse_answer_output(
        self,
        output: str,
        entities: list[EntityContext],
        relationships: list[RelationshipContext],
    ) -> AnswerGenerationResult:
        payload = self._extract_json_payload(output)
        answer = str(payload.get("answer", "")).strip() if payload else ""
        supporting_job_ids = self._normalize_string_list(
            payload.get("supporting_job_ids") if payload else []
        )
        available_job_ids = self._available_job_ids(entities, relationships)
        supporting_job_ids = [
            job_id for job_id in supporting_job_ids if job_id in available_job_ids
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

    async def generate_answer(
        self,
        question: str,
        entities: list[EntityContext],
        relationships: list[RelationshipContext],
    ) -> AnswerGenerationResult:
        """Generate an answer from entities and relationships."""
        logger.debug("Generating answer for question")

        prompt = self._build_prompt(question, entities, relationships)
        logger.debug("Prompt: %s", prompt)

        output = self._llm.generate(prompt)
        return self._parse_answer_output(output, entities, relationships)


answer_generation_service = AnswerGenerationService()
