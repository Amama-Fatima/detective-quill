
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

class Entity(BaseModel):
    name: str
    type: str
    mentions: List[str] = Field(default_factory=list)
    attributes: Dict[str, Any] = Field(default_factory=dict)


class Relationship(BaseModel):
    source: str
    target: str
    relation_type: str
    description: str
    confidence: float = 0.9


class PipelineMetadata(BaseModel):
    num_entities: int
    num_relationships: int
    num_raw_entities: int

class PipelineResult(BaseModel):
    entities: List[Entity] = Field(default_factory=list)
    relationships: List[Relationship] = Field(default_factory=list)
    metadata: PipelineMetadata


class SceneAnalysisRequest(BaseModel):
    job_id: str
    scene_text: str
    user_id: Optional[str] = None

class SceneAnalysisResponse(BaseModel):
    job_id: str
    status: Literal["pending", "processing", "completed", "failed"]
    result: Optional[PipelineResult] = None
    error_message: Optional[str] = None


class RawEntity(BaseModel):
    text: str
    label: str
    start: int
    end: int