from __future__ import annotations

from neo4j import GraphDatabase, AsyncDriver
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class Neo4jConnection:
    _driver: AsyncDriver | None = None

    @classmethod
    async def connect(cls) -> AsyncDriver:
        if cls._driver is None:
            cls._driver = GraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_user, settings.neo4j_password),
            )
            logger.info("Connected to Neo4j at %s", settings.neo4j_uri)
        return cls._driver

    @classmethod
    async def close(cls) -> None:
        if cls._driver is not None:
            cls._driver.close()
            cls._driver = None
            logger.info("Closed Neo4j connection")

    @classmethod
    def get_driver(cls) -> AsyncDriver:
        if cls._driver is None:
            raise RuntimeError("Neo4j driver not initialized. Call connect() first.")
        return cls._driver
