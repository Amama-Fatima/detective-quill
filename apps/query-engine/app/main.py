from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import get_logger, setup_logging
from app.core.neo4j import Neo4jConnection

setup_logging(settings.log_level)
logger = get_logger(__name__)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    logger.info("Starting up Query Engine...")
    await Neo4jConnection.connect()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    logger.info("Shutting down Query Engine...")
    await Neo4jConnection.close()


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}

app.include_router(api_router)

logger.info("Query engine initialized")
