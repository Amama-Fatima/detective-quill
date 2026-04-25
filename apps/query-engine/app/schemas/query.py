from typing import Any
from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Natural language question")
    fs_node_id: str = Field(..., min_length=1, description="FS node id")
    project_id: str = Field(..., min_length=1, description="Project id")


class EntityContext(BaseModel):
    name: str
    mentions: list[str] = Field(default_factory=list)


class RelationshipContext(BaseModel):
    source: str
    target: str
    relation_type: str


class GraphContext(BaseModel):
    fs_node_id: str
    project_id: str | None = None
    active_branch_id: str | None = None
    is_file_scoped: bool = False
    job_id: str | None = None
    entities: list[EntityContext] = Field(default_factory=list)
    relationships: list[RelationshipContext] = Field(default_factory=list)


class QueryResponse(BaseModel):
    status: str
    message: str
    question: str
    fs_node_id: str
    job_id: str | None = None
    entities: list[EntityContext] = Field(default_factory=list)
    relationships: list[RelationshipContext] = Field(default_factory=list)
    cypher: str | None = None
    data: list[dict[str, Any]] = Field(default_factory=list)
