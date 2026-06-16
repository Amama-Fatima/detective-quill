from fastapi import APIRouter

from app.api.endpoints.query_vector import router as query_vector_router

api_router = APIRouter()
api_router.include_router(query_vector_router)
