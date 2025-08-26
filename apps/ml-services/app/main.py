from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
import asyncio
import logging
import uvicorn

from app.core.config import settings
# from app.services.queue_consumer import start_queue_consumer
from app.core.logging_config import setup_logging


setup_logging()
logger = logging.getLogger(__name__)

# -----------------------
# Lifespan events (startup/shutdown)
# -----------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting ML Service...")

    # Start background consumer task
    consumer_task = asyncio.create_task(
        # start_queue_consumer()
        )

    yield  # <-- app is running here

    logger.info("🛑 Shutting down ML Service...")
    consumer_task.cancel()
    try:
        await consumer_task
    except asyncio.CancelledError:
        logger.info("Background consumer task cancelled gracefully.")

# -----------------------
# FastAPI app
# -----------------------
app = FastAPI(
    title=settings.app_name,
    description="ML Service for embedding generation and semantic search",
    version="1.0.0",
    lifespan=lifespan
)

# -----------------------
# Middleware for request logging
# -----------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"➡️ Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"⬅️ Completed response: status_code={response.status_code}")
    return response

# -----------------------
# Routes
# -----------------------
@app.get("/")
async def root():
    logger.info("Root endpoint was called")
    return {"message": "ML Service is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.app_name}

@app.get("/ready")
async def readiness_check():
    # Could check DB, Supabase, RabbitMQ connections here
    return {"status": "ready"}

@app.get("/live")
async def liveness_check():
    # Simply confirms the process is alive
    return {"status": "alive"}


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.debug
    )
