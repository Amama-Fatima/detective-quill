from fastapi import APIRouter
from fastapi import HTTPException

from app.core.logging import get_logger
from app.schemas.query import QueryRequest, QueryResponse
from app.services.vector_rag_service import vector_rag_service

router = APIRouter(tags=["query-vector"])
logger = get_logger(__name__)


@router.post("/query-vector", response_model=QueryResponse)
async def query_vector(payload: QueryRequest) -> QueryResponse:
    logger.info("Received vector query request: %s", payload.question)

    if payload.fs_node_id is None or payload.fs_node_id.strip() == "":
        raise HTTPException(
            status_code=404,
            detail="fs_node_id is required and cannot be empty",
        )

    if payload.project_id is None or payload.project_id.strip() == "":
        raise HTTPException(
            status_code=404,
            detail="project_id is required and cannot be empty",
        )

    try:
        return await vector_rag_service.query(
            question=payload.question,
            project_id=payload.project_id,
            fs_node_id=payload.fs_node_id,
        )
    except ValueError as exc:
        logger.warning("Vector query validation blocked: %s", str(exc))
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Vector query processing failed")
        raise HTTPException(status_code=500, detail="Vector query processing failed") from exc