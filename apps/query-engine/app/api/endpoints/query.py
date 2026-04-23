from fastapi import APIRouter
from fastapi import HTTPException

from app.core.logging import get_logger
from app.schemas.query import QueryRequest, QueryResponse
from app.services.graph_rag_service import graph_rag_service

router = APIRouter(tags=["query"])
logger = get_logger(__name__)


@router.post("/query", response_model=QueryResponse)
async def query_graph(payload: QueryRequest) -> QueryResponse:
    logger.info("Received query request: %s", payload.question)

    try:
        result = await graph_rag_service.query(payload.question)
    except ValueError as exc:
        logger.warning("Query validation blocked: %s", str(exc))
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Query processing failed")
        raise HTTPException(status_code=500, detail="Query processing failed") from exc

    return QueryResponse(
        status="ok",
        message=result.answer,
        question=payload.question,
        cypher=result.cypher,
        data=result.data,
    )
