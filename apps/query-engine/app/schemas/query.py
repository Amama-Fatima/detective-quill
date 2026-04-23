from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Natural language question")


class QueryResponse(BaseModel):
    status: str
    message: str
    question: str
    cypher: str | None = None
    data: list[dict] = Field(default_factory=list)
