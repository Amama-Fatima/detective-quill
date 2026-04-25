from dataclasses import dataclass
import re
from typing import Any

from app.core.logging import get_logger
from app.schemas.query import GraphContext
from app.schemas.query import RelationshipContext
from app.services.cypher_generation_service import CypherGenerationService
from app.services.cypher_validation_service import validate_cypher_query
from app.services.query_execution_service import QueryExecutionService

logger = get_logger(__name__)


@dataclass
class QueryResult:
    answer: str
    cypher: str
    data: list[dict[str, Any]]


class GraphRAGService:
    _VERB_CONNECTORS = r"[a-z]+(?:\s+[a-z]+){0,2}"

    def __init__(self) -> None:
        self._cypher_generation_service = CypherGenerationService()
        self._query_execution_service = QueryExecutionService()

    def generate_cypher(
        self,
        question: str,
        scene_id: str | None = None,
        entity_relationship_context: list[RelationshipContext] | None = None,
    ) -> str:
        return self._cypher_generation_service.generate_cypher(
            question,
            scene_id=scene_id,
            entity_relationship_context=entity_relationship_context,
        )

    async def execute_query(self, cypher: str) -> list[dict[str, Any]]:
        validate_cypher_query(cypher)
        return await self._query_execution_service.execute(cypher)

    @staticmethod
    def _compile_term_pattern(term: str) -> re.Pattern[str]:
        return re.compile(rf"(?<!\\w){re.escape(term)}(?!\\w)", re.IGNORECASE)

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

    @staticmethod
    def _extract_entity_relationship_context(
        context: GraphContext | None, entity_pair: tuple[str, str] | None
    ) -> list[RelationshipContext] | None:
        if context is None or not context.relationships or not entity_pair:
            return None

        first_entity, second_entity = entity_pair
        first_lower = first_entity.lower()
        second_lower = second_entity.lower()
        filtered: list[RelationshipContext] = []
        seen: set[tuple[str, str, str]] = set()

        for relationship in context.relationships:
            source = relationship.source.strip()
            target = relationship.target.strip()
            relation_type = relationship.relation_type.strip()

            if not source and not target:
                continue

            source_lower = source.lower()
            target_lower = target.lower()
            is_pair_direction = (
                (source_lower == first_lower and target_lower == second_lower)
                or (source_lower == second_lower and target_lower == first_lower)
            )
            if not is_pair_direction:
                continue

            key = (source, relation_type, target)
            if key in seen:
                continue

            seen.add(key)
            filtered.append(
                RelationshipContext(
                    source=source,
                    target=target,
                    relation_type=relation_type,
                )
            )

        return filtered or None

    @classmethod
    def _extract_relation_entity_pair(
        cls, question: str, included_entities: list[str]
    ) -> tuple[str, str] | None:
        if len(included_entities) < 2:
            return None

        lowered = question.lower()
        entity_pattern = "|".join(
            sorted((re.escape(entity.lower()) for entity in included_entities), key=len, reverse=True)
        )
        if not entity_pattern:
            return None

        # Pattern 1: "A verb B"
        direct_pattern = re.compile(
            rf"(?P<e1>{entity_pattern})\s+(?P<v>{cls._VERB_CONNECTORS})\s+(?P<e2>{entity_pattern})",
            re.IGNORECASE,
        )

        # Pattern 2: "A and B verb"
        coordinated_pattern = re.compile(
            rf"(?P<e1>{entity_pattern})\s+(?:and|&)\s+(?P<e2>{entity_pattern})\s+(?P<v>{cls._VERB_CONNECTORS})",
            re.IGNORECASE,
        )

        neutral_connectors = {"and", "or", "with", "in", "from", "to", "at"}

        for pattern in (direct_pattern, coordinated_pattern):
            for match in pattern.finditer(lowered):
                first = match.group("e1").strip()
                second = match.group("e2").strip()
                if first == second:
                    continue

                verb_phrase = match.group("v").strip().lower()
                if verb_phrase in neutral_connectors:
                    continue

                resolved_first = next(
                    (entity for entity in included_entities if entity.lower() == first),
                    None,
                )
                resolved_second = next(
                    (entity for entity in included_entities if entity.lower() == second),
                    None,
                )
                if resolved_first and resolved_second:
                    return resolved_first, resolved_second

        return None

    async def query(
        self, question: str, context: GraphContext | None = None
    ) -> QueryResult:

        logger.info("Generating query for question")
        contextual_question, included_entities = self._normalize_entity_mentions(
            question, context
        )
        scene_id = context.fs_node_id if context and context.is_file_scoped else None
        relation_entity_pair = self._extract_relation_entity_pair(
            contextual_question, included_entities
        )
        entity_relationship_context = (
            self._extract_entity_relationship_context(context, relation_entity_pair)
            if relation_entity_pair
            else None
        )
        cypher = self.generate_cypher(
            contextual_question,
            scene_id=scene_id,
            entity_relationship_context=entity_relationship_context,
        )
        validate_cypher_query(cypher)
        data = await self.execute_query(cypher)
        return QueryResult(answer="Query executed successfully", cypher=cypher, data=data)


graph_rag_service = GraphRAGService()
