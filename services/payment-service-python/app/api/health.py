"""
Health check endpoint.
"""
from datetime import datetime
from fastapi import APIRouter

from app.core.config import settings
from app.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Returns the health status of the Payment Service.",
)
async def health_check() -> HealthResponse:
    """
    Check service health.
    
    Returns service status, name, version, and current timestamp.
    """
    return HealthResponse(
        status="ok",
        service=settings.SERVICE_NAME,
        version=settings.SERVICE_VERSION,
        timestamp=datetime.utcnow(),
    )

