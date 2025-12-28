"""
RabbitMQ publisher for payment events.
"""
import json
import logging
import aio_pika
from typing import Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Global connection and channel
_connection: Optional[aio_pika.RobustConnection] = None
_channel: Optional[aio_pika.Channel] = None


async def get_rabbitmq_connection() -> aio_pika.RobustConnection:
    """Get or create RabbitMQ connection."""
    global _connection
    
    if _connection is None or _connection.is_closed:
        logger.info(f"Connecting to RabbitMQ at {settings.RABBITMQ_HOST}...")
        _connection = await aio_pika.connect_robust(
            settings.RABBITMQ_URL,
            timeout=30,
        )
        logger.info("Connected to RabbitMQ")
    
    return _connection


async def get_channel() -> aio_pika.Channel:
    """Get or create RabbitMQ channel."""
    global _channel
    
    connection = await get_rabbitmq_connection()
    
    if _channel is None or _channel.is_closed:
        _channel = await connection.channel()
        
        # Declare payment exchange
        await _channel.declare_exchange(
            settings.PAYMENT_EXCHANGE,
            aio_pika.ExchangeType.DIRECT,
            durable=True,
        )
        logger.info(f"Declared exchange: {settings.PAYMENT_EXCHANGE}")
    
    return _channel


async def publish_payment_event(event_data: dict, routing_key: str) -> None:
    """
    Publish a payment event to RabbitMQ.
    
    Args:
        event_data: Event payload
        routing_key: Routing key (e.g., 'payment.success' or 'payment.failed')
    """
    try:
        channel = await get_channel()
        exchange = await channel.get_exchange(settings.PAYMENT_EXCHANGE)
        
        message = aio_pika.Message(
            body=json.dumps(event_data).encode(),
            content_type="application/json",
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
        )
        
        await exchange.publish(message, routing_key=routing_key)
        
        logger.info(
            f"Published event to {settings.PAYMENT_EXCHANGE}/{routing_key}: "
            f"payment_id={event_data.get('payment_id')}"
        )
        
    except Exception as e:
        logger.error(f"Failed to publish event: {str(e)}")
        raise


async def close_rabbitmq() -> None:
    """Close RabbitMQ connections."""
    global _connection, _channel
    
    if _channel and not _channel.is_closed:
        await _channel.close()
        _channel = None
        logger.info("RabbitMQ channel closed")
    
    if _connection and not _connection.is_closed:
        await _connection.close()
        _connection = None
        logger.info("RabbitMQ connection closed")

