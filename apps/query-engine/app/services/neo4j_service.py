from neo4j import AsyncSession
from app.core.neo4j import Neo4jConnection
from app.core.logging import get_logger

logger = get_logger(__name__)


class Neo4jService:
    @staticmethod
    async def execute_query(cypher: str, parameters: dict | None = None) -> list[dict]:
        driver = Neo4jConnection.get_driver()
        async with driver.session() as session:
            logger.debug("Executing Cypher: %s with params: %s", cypher, parameters)
            result = await session.run(cypher, parameters or {})
            records = await result.values()
            logger.debug("Query returned %d records", len(records))
            return [dict(record) if hasattr(record, '__dict__') else record for record in records]

    @staticmethod
    async def test_connection() -> bool:
        try:
            driver = Neo4jConnection.get_driver()
            async with driver.session() as session:
                result = await session.run("RETURN 1 as test")
                await result.single()
            logger.info("Neo4j connection test passed")
            return True
        except Exception as e:
            logger.error("Neo4j connection test failed: %s", str(e))
            return False
