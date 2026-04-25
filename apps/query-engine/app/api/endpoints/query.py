from fastapi import APIRouter
from fastapi import HTTPException

from app.core.logging import get_logger
from app.schemas.query import (
    EntityContext,
    QueryRequest,
    QueryResponse,
    RelationshipContext,
)
from app.services.graph_rag_service import graph_rag_service
from app.services.nlp_context_service import nlp_context_service

router = APIRouter(tags=["query"])
logger = get_logger(__name__)


@router.post("/query/{fs_node_id}", response_model=QueryResponse)
async def query_graph(fs_node_id: str, payload: QueryRequest) -> QueryResponse:
    logger.info("Received query request: %s", payload.question)

    if payload.fs_node_id != fs_node_id:
        raise HTTPException(
            status_code=400,
            detail="fs_node_id in URL and request body must match",
        )

    try:
        nlp_context = nlp_context_service.fetch_context_for_fs_node(
            fs_node_id=fs_node_id,
            question=payload.question,
            project_id=payload.project_id,
        )
        result = await graph_rag_service.query(payload.question, context=nlp_context)
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
        fs_node_id=fs_node_id,
        job_id=nlp_context.job_id,
        entities=[
            EntityContext(name=entity.name, mentions=entity.mentions)
            for entity in nlp_context.entities
        ],
        relationships=[
            RelationshipContext(
                source=relationship.source,
                target=relationship.target,
                relation_type=relationship.relation_type,
            )
            for relationship in nlp_context.relationships
        ],
        cypher=result.cypher,
        data=result.data,
    )
