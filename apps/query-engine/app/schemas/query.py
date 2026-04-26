from __future__ import annotations

from dataclasses import dataclass, field as dataclass_field
from typing import List, Optional
from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Natural language question")
    fs_node_id: str = Field(..., min_length=1, description="FS node id")
    project_id: str = Field(..., min_length=1, description="Project id")


class EntityContext(BaseModel):
    job_id: Optional[str] = None
    name: str
    mentions: List[str] = Field(default_factory=list)


class RelationshipContext(BaseModel):
    job_id: Optional[str] = None
    source: str
    target: str
    relation_type: str


class GraphContext(BaseModel):
    fs_node_id: str
    project_id: Optional[str] = None
    active_branch_id: Optional[str] = None
    is_file_scoped: bool = False
    job_id: Optional[str] = None
    entities: List[EntityContext] = Field(default_factory=list)
    relationships: List[RelationshipContext] = Field(default_factory=list)

class SupportingEvidence(BaseModel):
    job_id: Optional[str] = None
    resolved_text: Optional[str] = None
    fs_node_id: Optional[str] = None
    fs_node_name: Optional[str] = None


class QueryResponse(BaseModel):
    status: str
    question: str
    answer: Optional[str] = None
    supporting_ids_and_text: List[SupportingEvidence] = Field(default_factory=list)
    entities: List[EntityContext] = Field(default_factory=list)
    relationships: List[RelationshipContext] = Field(default_factory=list)
    # cypher: Optional[str] = None


@dataclass
class AnswerGenerationResult:
    answer: str
    supporting_job_ids: list[str] = dataclass_field(default_factory=list)


@dataclass
class QueryResult:
    answer: str
    supporting_job_ids: list[str]
    entities: list[EntityContext]
    relationships: list[RelationshipContext]