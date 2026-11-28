"""Root API v1 router aggregating all endpoint modules."""

from fastapi import APIRouter

from api.v1.endpoints import courses, health, learning

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(courses.router)
api_router.include_router(learning.router)

