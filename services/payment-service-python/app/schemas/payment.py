"""
Pydantic schemas for Payment API.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class PaymentStatusEnum(str, Enum):
    """Payment status for API."""
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class PaymentMethodEnum(str, Enum):
    """Payment method for API."""
    CARD = "CARD"
    CASH = "CASH"
    SIMULATED = "SIMULATED"


class PaymentCreate(BaseModel):
    """Schema for creating a payment."""
    order_id: str = Field(..., description="The order ID to process payment for")
    amount: float = Field(..., gt=0, description="Payment amount")
    payment_method: PaymentMethodEnum = Field(
        default=PaymentMethodEnum.SIMULATED,
        description="Payment method"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "order_id": "order-123",
                "amount": 99.99,
                "payment_method": "SIMULATED"
            }
        }


class PaymentResponse(BaseModel):
    """Schema for payment response."""
    id: str = Field(..., description="Payment ID")
    order_id: str = Field(..., description="Order ID")
    amount: float = Field(..., description="Payment amount")
    status: PaymentStatusEnum = Field(..., description="Payment status")
    method: PaymentMethodEnum = Field(..., description="Payment method")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "order_id": "order-123",
                "amount": 99.99,
                "status": "SUCCESS",
                "method": "SIMULATED",
                "created_at": "2025-12-27T10:00:00"
            }
        }


class PaymentEvent(BaseModel):
    """Schema for payment events published to RabbitMQ."""
    payment_id: str
    order_id: str
    status: str
    amount: float
    timestamp: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "payment_id": "550e8400-e29b-41d4-a716-446655440000",
                "order_id": "order-123",
                "status": "SUCCESS",
                "amount": 99.99,
                "timestamp": "2025-12-27T10:00:00.000Z"
            }
        }


class HealthResponse(BaseModel):
    """Schema for health check response."""
    status: str = Field(..., description="Service health status")
    service: str = Field(..., description="Service name")
    version: str = Field(..., description="Service version")
    timestamp: datetime = Field(..., description="Current timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "ok",
                "service": "payment-service",
                "version": "1.0.0",
                "timestamp": "2025-12-27T10:00:00"
            }
        }


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str = Field(..., description="Error message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Payment not found"
            }
        }

