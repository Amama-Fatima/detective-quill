from dataclasses import dataclass
from typing import Any

from app.core.logging import get_logger
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
    def __init__(self) -> None:
        self._cypher_generation_service = CypherGenerationService()
        self._query_execution_service = QueryExecutionService()

    def generate_cypher(self, question: str) -> str:
        return self._cypher_generation_service.generate_cypher(question)

    async def execute_query(self, cypher: str) -> list[dict[str, Any]]:
        validate_cypher_query(cypher)
        return await self._query_execution_service.execute(cypher)

    async def query(self, question: str) -> QueryResult:

        logger.info("Generating query for question")
        cypher = self.generate_cypher(question)
        validate_cypher_query(cypher)
        data = await self.execute_query(cypher)
        return QueryResult(answer="Query executed successfully", cypher=cypher, data=data)


graph_rag_service = GraphRAGService()
