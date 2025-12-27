from sqlalchemy import Column, String, Numeric, DateTime, Enum
from sqlalchemy.dialects.mysql import CHAR
from datetime import datetime
import uuid
import enum
from app.db.session import Base


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class PaymentMethod(str, enum.Enum):
    CARD = "CARD"
    CASH = "CASH"
    SIMULATED = "SIMULATED"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(255), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    method = Column(Enum(PaymentMethod), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
