from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
import random

from app.db.session import get_db
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.messaging.publisher import publish_payment_event

router = APIRouter(prefix="/payments", tags=["payments"])


class PaymentRequest(BaseModel):
    order_id: str = Field(..., description="Order ID to process payment for")
    amount: float = Field(..., gt=0, description="Payment amount")
    payment_method: PaymentMethod = Field(default=PaymentMethod.SIMULATED)


class PaymentResponse(BaseModel):
    payment_id: str
    order_id: str
    amount: float
    status: PaymentStatus
    method: PaymentMethod
    created_at: str

    class Config:
        from_attributes = True


def simulate_payment() -> PaymentStatus:
    """Simulate payment processing with 80% success rate"""
    return PaymentStatus.SUCCESS if random.random() < 0.8 else PaymentStatus.FAILED


@router.post("", response_model=PaymentResponse, status_code=201)
async def create_payment(
    payment_req: PaymentRequest,
    db: Session = Depends(get_db)
):
    """Process a payment for an order"""
    
    # Simulate payment processing
    payment_status = simulate_payment()
    
    # Create payment record
    payment = Payment(
        order_id=payment_req.order_id,
        amount=Decimal(str(payment_req.amount)),
        status=payment_status,
        method=payment_req.payment_method
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Publish event
    event_type = "payment.success" if payment_status == PaymentStatus.SUCCESS else "payment.failed"
    publish_payment_event(event_type, payment)
    
    return PaymentResponse(
        payment_id=payment.id,
        order_id=payment.order_id,
        amount=float(payment.amount),
        status=payment.status,
        method=payment.method,
        created_at=payment.created_at.isoformat()
    )


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(payment_id: str, db: Session = Depends(get_db)):
    """Get payment details by ID"""
    
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return PaymentResponse(
        payment_id=payment.id,
        order_id=payment.order_id,
        amount=float(payment.amount),
        status=payment.status,
        method=payment.method,
        created_at=payment.created_at.isoformat()
    )
