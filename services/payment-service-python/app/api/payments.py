"""
Payment API endpoints.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import PaymentCreate, PaymentResponse, ErrorResponse
from app.services import PaymentService
from app.messaging.publisher import publish_payment_event
from app.models.payment import PaymentStatus

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post(
    "",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Payment created successfully"},
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
    summary="Create a new payment",
    description="""
    Process a payment for an order.
    
    The payment will be simulated with a random SUCCESS/FAILED result.
    A corresponding event will be published to RabbitMQ based on the result.
    """,
)
async def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
) -> PaymentResponse:
    """
    Create and process a new payment.
    
    - **order_id**: The order ID to process payment for
    - **amount**: Payment amount (must be greater than 0)
    - **payment_method**: Payment method (CARD, CASH, or SIMULATED)
    """
    try:
        # Create payment
        payment = PaymentService.create_payment(db, payment_data)
        
        # Build and publish event
        event = PaymentService.build_payment_event(payment)
        routing_key = (
            "payment.success" 
            if payment.status == PaymentStatus.SUCCESS 
            else "payment.failed"
        )
        
        await publish_payment_event(event.model_dump(), routing_key)
        
        logger.info(f"Payment processed: {payment.id} -> {payment.status.value}")
        
        return PaymentResponse(
            id=payment.id,
            order_id=payment.order_id,
            amount=float(payment.amount),
            status=payment.status.value,
            method=payment.method.value,
            created_at=payment.created_at,
        )
        
    except Exception as e:
        logger.error(f"Error creating payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process payment: {str(e)}"
        )


@router.get(
    "/{payment_id}",
    response_model=PaymentResponse,
    responses={
        200: {"description": "Payment found"},
        404: {"model": ErrorResponse, "description": "Payment not found"},
    },
    summary="Get payment by ID",
    description="Retrieve a payment record by its unique ID.",
)
async def get_payment(
    payment_id: str,
    db: Session = Depends(get_db),
) -> PaymentResponse:
    """
    Get a payment by its ID.
    
    - **payment_id**: The unique payment ID (UUID)
    """
    payment = PaymentService.get_payment_by_id(db, payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with id {payment_id} not found"
        )
    
    return PaymentResponse(
        id=payment.id,
        order_id=payment.order_id,
        amount=float(payment.amount),
        status=payment.status.value,
        method=payment.method.value,
        created_at=payment.created_at,
    )

