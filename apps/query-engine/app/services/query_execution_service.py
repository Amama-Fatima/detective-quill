from typing import Any

from app.core.logging import get_logger
from app.core.neo4j import Neo4jConnection

logger = get_logger(__name__)


class QueryExecutionService:
    async def execute(self, cypher: str) -> list[dict[str, Any]]:
        driver = Neo4jConnection.get_driver()
        logger.info("Executing validated Cypher against Neo4j")

        async with driver.session() as session:
            result = await session.run(cypher)
            records = await result.data()
            return records
