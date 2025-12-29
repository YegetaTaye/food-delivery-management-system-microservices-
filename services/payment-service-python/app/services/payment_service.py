"""
Payment business logic service.
"""
import random
import uuid
import logging
from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session

from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.schemas.payment import PaymentCreate, PaymentEvent

logger = logging.getLogger(__name__)


class PaymentService:
    """Service class for payment operations."""
    
    @staticmethod
    def simulate_payment() -> PaymentStatus:
        """
        Simulate payment processing.
        Returns SUCCESS with 80% probability, FAILED with 20%.
        """
        return PaymentStatus.SUCCESS if random.random() < 0.8 else PaymentStatus.FAILED
    
    @staticmethod
    def create_payment(
        db: Session,
        payment_data: PaymentCreate
    ) -> Payment:
        """
        Create a new payment record and simulate processing.
        
        Args:
            db: Database session
            payment_data: Payment creation data
            
        Returns:
            Created payment record
        """
        # Map API enum to model enum
        method_map = {
            "CARD": PaymentMethod.CARD,
            "CASH": PaymentMethod.CASH,
            "SIMULATED": PaymentMethod.SIMULATED,
        }
        
        # Create payment with PENDING status
        payment = Payment(
            id=str(uuid.uuid4()),
            order_id=payment_data.order_id,
            amount=Decimal(str(payment_data.amount)),
            status=PaymentStatus.PENDING,
            method=method_map.get(payment_data.payment_method.value, PaymentMethod.SIMULATED),
            created_at=datetime.utcnow(),
        )
        
        db.add(payment)
        db.flush()
        
        # Simulate payment processing
        payment.status = PaymentService.simulate_payment()
        
        db.commit()
        db.refresh(payment)
        
        logger.info(
            f"Payment created: id={payment.id}, order_id={payment.order_id}, "
            f"status={payment.status.value}, amount={payment.amount}"
        )
        
        return payment
    
    @staticmethod
    def get_payment_by_id(db: Session, payment_id: str) -> Optional[Payment]:
        """
        Retrieve a payment by ID.
        
        Args:
            db: Database session
            payment_id: Payment UUID
            
        Returns:
            Payment record or None
        """
        return db.query(Payment).filter(Payment.id == payment_id).first()
    
    @staticmethod
    def get_all_payments(db: Session, limit: int = 100, offset: int = 0) -> list[Payment]:
        """
        Retrieve all payments with pagination.
        
        Args:
            db: Database session
            limit: Maximum number of records to return
            offset: Number of records to skip
            
        Returns:
            List of payment records
        """
        return db.query(Payment).order_by(Payment.created_at.desc()).offset(offset).limit(limit).all()
    
    @staticmethod
    def create_payment_from_order_event(
        db: Session,
        order_id: str,
        amount: float
    ) -> Payment:
        """
        Create a payment from an order.created event.
        
        Args:
            db: Database session
            order_id: Order ID from event
            amount: Order total amount
            
        Returns:
            Created payment record
        """
        payment_data = PaymentCreate(
            order_id=order_id,
            amount=amount,
            payment_method="SIMULATED"
        )
        return PaymentService.create_payment(db, payment_data)
    
    @staticmethod
    def build_payment_event(payment: Payment) -> PaymentEvent:
        """
        Build a payment event for publishing to RabbitMQ.
        
        Args:
            payment: Payment record
            
        Returns:
            PaymentEvent schema
        """
        return PaymentEvent(
            payment_id=payment.id,
            order_id=payment.order_id,
            status=payment.status.value,
            amount=float(payment.amount),
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

