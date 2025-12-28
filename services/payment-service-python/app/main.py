"""
Payment Service - FastAPI Application Entry Point.

A microservice for processing payments in a food delivery system.
Communicates with other services via RabbitMQ events.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db import init_db, close_db
from app.api import payments_router, health_router
from app.messaging import start_consumer_task, stop_consumer, close_rabbitmq

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info(f"Starting {settings.SERVICE_NAME} v{settings.SERVICE_VERSION}...")
    
    try:
        # Initialize database
        init_db()
        logger.info("Database initialized")
        
        # Start RabbitMQ consumer
        await start_consumer_task()
        logger.info("RabbitMQ consumer started")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise
    
    logger.info(f"🚀 {settings.SERVICE_NAME} is ready!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    
    try:
        await stop_consumer()
        await close_rabbitmq()
        close_db()
        logger.info("Cleanup completed")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")


# Create FastAPI application
app = FastAPI(
    title="Payment Service API",
    description="""
## Payment Service

A microservice for processing payments in a food delivery system.

### Features

- **Payment Processing**: Simulate payment processing for orders
- **Event-Driven**: Consumes order events and publishes payment results
- **RabbitMQ Integration**: Asynchronous communication with other services

### Events

**Consumed:**
- `order.created` - Triggers automatic payment processing

**Published:**
- `payment.success` - Payment completed successfully
- `payment.failed` - Payment processing failed

### Architecture

This service follows microservice best practices:
- Own database (MySQL)
- Event-driven communication
- Stateless design
- Health check endpoint
    """,
    version=settings.SERVICE_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(payments_router)


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint - redirects to docs."""
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.SERVICE_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )

