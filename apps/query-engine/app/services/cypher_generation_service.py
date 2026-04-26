from __future__ import annotations

from neo4j import GraphDatabase

from app.core.config import settings
from app.core.logging import get_logger
from app.core.prompts import CYPHER_PROMPT_TEMPLATE, GRAPH_CYPHER_EXAMPLES_BLOCK, GRAPH_SCHEMA_TEXT, CONTEXT_USAGE_INSTRUCTIONS
from app.schemas.query import RelationshipContext
from app.services.cypher_utils import ensure_limit_clause, extract_cypher
from app.services.cypher_validation_service import validate_cypher_query
from app.services.modal_llm import ModalQwenLLM
from app.services.prompt_template import PromptTemplate

logger = get_logger(__name__)


class CypherGenerationService:
    def __init__(self) -> None:
        if not settings.use_modal_nl2cypher:
            raise RuntimeError(
                "Modal NL2Cypher is disabled. Set USE_MODAL_NL2CYPHER=true to enable it."
            )

        self._driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )
        self._cypher_prompt = PromptTemplate.from_template(CYPHER_PROMPT_TEMPLATE)
        self._llm = ModalQwenLLM(timeout_seconds=settings.modal_timeout_seconds)

    @staticmethod
    def _build_scene_scope_instructions(scene_id: str | None) -> str:
        if not scene_id:
            return "No scene_id scope constraint."

        return (
            f"This query is file-scoped. You MUST limit the query to Scene nodes where scene_id = '{scene_id}'. "
            "When a Scene alias is present, enforce this with a WHERE clause (for example: WHERE s.scene_id = '<scene_id>')."
        )

    @staticmethod
    def _build_entity_relationship_context(
        entity_relationship_context: list[RelationshipContext] | None,
    ) -> str:
        lines = [
            f"- ({item.source})-[{item.relation_type}]->({item.target})"
            for item in entity_relationship_context
        ]
        return "\n".join(lines)

    def _build_entity_relationship_context_block(
        self, entity_relationship_context: list[RelationshipContext] | None
    ) -> str:
        if not entity_relationship_context:
            return ""

        return (
            "ENTITY RELATIONSHIP CONTEXT:\n"
            f"{self._build_entity_relationship_context(entity_relationship_context)}"
        )

    @staticmethod
    def _build_context_usage_block(
        entity_relationship_context: list[RelationshipContext] | None,
    ) -> str:
        if not entity_relationship_context:
            return ""

        return (CONTEXT_USAGE_INSTRUCTIONS)

    def _build_prompt(
        self,
        question: str,
        scene_id: str | None = None,
        entity_relationship_context: list[RelationshipContext] | None = None,
    ) -> str:
        base = self._cypher_prompt

        return base.format(
            schema=GRAPH_SCHEMA_TEXT,
            question=question,
            limit=settings.cypher_result_limit,
            examples_block=GRAPH_CYPHER_EXAMPLES_BLOCK,
            scene_scope_instructions=self._build_scene_scope_instructions(scene_id),
            entity_relationship_context_block=self._build_entity_relationship_context_block(
                entity_relationship_context
            ),
            context_usage_block=self._build_context_usage_block(
                entity_relationship_context
            ),
        )

    def _normalize_output(self, output: str) -> str:
        cleaned = extract_cypher(output)
        cleaned = ensure_limit_clause(cleaned, settings.cypher_result_limit)
        return cleaned

    def generate_cypher(
        self,
        question: str,
        scene_id: str | None = None,
        entity_relationship_context: list[RelationshipContext] | None = None,
    ) -> str:
        logger.debug("Generating Cypher for question")
        prompt = self._build_prompt(
            question,
            scene_id=scene_id,
            entity_relationship_context=entity_relationship_context,
        )
        generated = self._llm.generate(prompt)
        cypher = self._normalize_output(generated)
        validate_cypher_query(cypher)
        return cypher
