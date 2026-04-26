from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Any

from app.core.logging import get_logger
from app.schemas.query import EntityContext, GraphContext, RelationshipContext, QueryResult
from app.services.answer_generation_service import answer_generation_service

logger = get_logger(__name__)


class GraphRAGService:
    _VERB_CONNECTORS = r"[a-z]+(?:\s+[a-z]+){0,2}"

    def __init__(self) -> None:
        self._answer_service = answer_generation_service

    async def query(
        self, question: str, context: GraphContext | None = None
    ) -> QueryResult:

        logger.info("Generating answer for question")
        contextual_question, included_entities = self._normalize_entity_mentions(
            question, context
        )

        # Narrow context to entities included in the question and the
        # relationships connected to them. Fall back to full context when no
        # entities were explicitly included.
        all_entities = context.entities if context else []
        all_relationships = context.relationships if context else []
        entities, relationships = self._filter_context_for_answer(
            included_entities=included_entities,
            entities=all_entities,
            relationships=all_relationships,
        )

        # Generate answer directly from entities and relationships
        answer_result = await self._answer_service.generate_answer(
            contextual_question,
            entities=entities,
            relationships=relationships,
        )

        return QueryResult(
            answer=answer_result.answer,
            supporting_job_ids=answer_result.supporting_job_ids,
            entities=entities,
            relationships=relationships,
        )

    @staticmethod
    def _filter_context_for_answer(
        included_entities: list[str],
        entities: list[EntityContext],
        relationships: list[RelationshipContext],
    ) -> tuple[list[EntityContext], list[RelationshipContext]]:
        if not included_entities:
            return entities, relationships

        included_names = {name.strip().lower() for name in included_entities if name.strip()}
        filtered_entities = [
            entity
            for entity in entities
            if entity.name and entity.name.strip().lower() in included_names
        ]

        connected_names = {
            entity.name.strip().lower()
            for entity in filtered_entities
            if entity.name and entity.name.strip()
        }
        filtered_relationships = [
            relationship
            for relationship in relationships
            if (
                relationship.source
                and relationship.source.strip().lower() in connected_names
            )
            or (
                relationship.target
                and relationship.target.strip().lower() in connected_names
            )
        ]

        return filtered_entities, filtered_relationships

    @staticmethod
    def _compile_term_pattern(term: str) -> re.Pattern[str]:
        return re.compile(rf"(?<!\w){re.escape(term)}(?!\w)", re.IGNORECASE)

    @classmethod
    def _normalize_entity_mentions(
        cls, question: str, context: GraphContext | None
    ) -> tuple[str, list[str]]:
        if context is None or not context.entities:
            return question, []

        normalized_question = question
        included_entities: set[str] = set()
        for entity in context.entities:
            entity_name = entity.name.strip()
            if not entity_name:
                continue

            entity_name_pattern = cls._compile_term_pattern(entity_name)
            if entity_name_pattern.search(normalized_question):
                included_entities.add(entity_name)
                continue

            mentions = sorted(
                [m.strip() for m in entity.mentions if m and m.strip()],
                key=len,
                reverse=True,
            )
            for mention in mentions:
                if mention.lower() == entity_name.lower():
                    continue

                mention_pattern = cls._compile_term_pattern(mention)
                if mention_pattern.search(normalized_question):
                    normalized_question = mention_pattern.sub(
                        entity_name, normalized_question
                    )
                    included_entities.add(entity_name)

        return normalized_question, sorted(included_entities)


graph_rag_service = GraphRAGService()
