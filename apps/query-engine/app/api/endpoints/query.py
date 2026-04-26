from fastapi import APIRouter
from fastapi import HTTPException

from app.core.logging import get_logger
from app.schemas.query import (
    EntityContext,
    QueryRequest,
    QueryResult,
    RelationshipContext,
)
from app.services.graph_rag_service import graph_rag_service
from app.services.nlp_context_service import nlp_context_service
from app.services.supporting_evidence_service import supporting_evidence_service

router = APIRouter(tags=["query"])
logger = get_logger(__name__)


@router.post("/query", response_model=QueryResult)
async def query_graph(payload: QueryRequest) -> QueryResult:
    logger.info("Received query request: %s", payload.question)

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
        nlp_context = nlp_context_service.fetch_context_for_fs_node(
            fs_node_id=payload.fs_node_id,
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

    supporting_evidence = supporting_evidence_service.fetch_by_job_ids(
        result.supporting_job_ids
    )

    return QueryResult(
        status="ok",
        question=payload.question,
        answer=result.answer,
        supporting_ids_and_text=supporting_evidence,
        entities=[
            EntityContext(
                job_id=entity.job_id,
                name=entity.name,
                mentions=entity.mentions,
            )
            for entity in result.entities
        ],
        relationships=[
            RelationshipContext(
                job_id=relationship.job_id,
                source=relationship.source,
                target=relationship.target,
                relation_type=relationship.relation_type,
            )
            for relationship in result.relationships
        ],
        exact_entities=result.exact_entities,
        exact_relationships=result.exact_relationships,
    )
