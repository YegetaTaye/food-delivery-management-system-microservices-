"""
Payment model for database operations.
"""
import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Numeric, DateTime, Enum
from sqlalchemy.dialects.mysql import CHAR

from app.db.session import Base


class PaymentStatus(str, PyEnum):
    """Payment status enumeration."""
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class PaymentMethod(str, PyEnum):
    """Payment method enumeration."""
    CARD = "CARD"
    CASH = "CASH"
    SIMULATED = "SIMULATED"


class Payment(Base):
    """Payment database model."""
    
    __tablename__ = "payments"
    
    id = Column(
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    order_id = Column(String(255), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(
        Enum(PaymentStatus),
        nullable=False,
        default=PaymentStatus.PENDING
    )
    method = Column(
        Enum(PaymentMethod),
        nullable=False,
        default=PaymentMethod.SIMULATED
    )
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<Payment(id={self.id}, order_id={self.order_id}, status={self.status})>"
    
    def to_dict(self) -> dict:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "order_id": self.order_id,
            "amount": float(self.amount) if isinstance(self.amount, Decimal) else self.amount,
            "status": self.status.value if isinstance(self.status, PaymentStatus) else self.status,
            "method": self.method.value if isinstance(self.method, PaymentMethod) else self.method,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

