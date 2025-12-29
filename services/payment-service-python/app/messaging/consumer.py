"""
RabbitMQ consumer for order events.
"""
import json
import logging
import asyncio
import aio_pika
from typing import Optional

from app.core.config import settings
from app.db import get_db_context
from app.services import PaymentService
from app.messaging.publisher import publish_payment_event
from app.models.payment import PaymentStatus

logger = logging.getLogger(__name__)

_connection: Optional[aio_pika.RobustConnection] = None
_consumer_task: Optional[asyncio.Task] = None


async def process_order_created(message: aio_pika.IncomingMessage) -> None:
    """
    Process an order.created event.
    
    Creates a payment attempt and publishes the result.
    """
    async with message.process():
        try:
            body = json.loads(message.body.decode())
            logger.info(f"Received order.created event: {body}")
            
            # Extract order details
            order_id = body.get("orderId") or body.get("order_id")
            amount = body.get("totalAmount") or body.get("total") or body.get("amount") or 0.0
            
            if not order_id:
                logger.error("Missing order_id in event payload")
                return
            
            # Create payment in database
            with get_db_context() as db:
                payment = PaymentService.create_payment_from_order_event(
                    db=db,
                    order_id=order_id,
                    amount=float(amount),
                )
                
                # Build and publish result event
                event = PaymentService.build_payment_event(payment)
                routing_key = (
                    "payment.success"
                    if payment.status == PaymentStatus.SUCCESS
                    else "payment.failed"
                )
                
                await publish_payment_event(event.model_dump(), routing_key)
                
                logger.info(
                    f"Processed order.created -> payment {payment.id} "
                    f"with status {payment.status.value}"
                )
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode message: {e}")
        except Exception as e:
            logger.error(f"Error processing order.created event: {e}")
            raise


async def start_consumer() -> None:
    """Start consuming order.created events from RabbitMQ."""
    global _connection
    
    try:
        logger.info(f"Starting order event consumer...")
        
        # Connect to RabbitMQ
        _connection = await aio_pika.connect_robust(
            settings.RABBITMQ_URL,
            timeout=30,
        )
        
        channel = await _connection.channel()
        await channel.set_qos(prefetch_count=10)
        
        # Declare order exchange
        order_exchange = await channel.declare_exchange(
            settings.ORDER_EXCHANGE,
            aio_pika.ExchangeType.TOPIC,
            durable=True,
        )
        
        # Declare queue for order.created events
        queue = await channel.declare_queue(
            settings.ORDER_CREATED_QUEUE,
            durable=True,
        )
        
        # Bind queue to exchange
        await queue.bind(
            order_exchange,
            routing_key=settings.ORDER_CREATED_ROUTING_KEY,
        )
        
        logger.info(
            f"Bound queue {settings.ORDER_CREATED_QUEUE} to "
            f"{settings.ORDER_EXCHANGE}/{settings.ORDER_CREATED_ROUTING_KEY}"
        )
        
        # Start consuming
        await queue.consume(process_order_created)
        
        logger.info("Order event consumer started successfully")
        
        # Keep the consumer running
        try:
            await asyncio.Future()
        except asyncio.CancelledError:
            logger.info("Consumer task cancelled")
            
    except Exception as e:
        logger.error(f"Consumer error: {e}")
        raise


async def start_consumer_task() -> None:
    """Start the consumer as a background task."""
    global _consumer_task
    
    _consumer_task = asyncio.create_task(start_consumer())
    logger.info("Consumer background task created")


async def stop_consumer() -> None:
    """Stop the consumer and close connections."""
    global _connection, _consumer_task
    
    if _consumer_task:
        _consumer_task.cancel()
        try:
            await _consumer_task
        except asyncio.CancelledError:
            pass
        _consumer_task = None
        logger.info("Consumer task stopped")
    
    if _connection and not _connection.is_closed:
        await _connection.close()
        _connection = None
        logger.info("Consumer connection closed")

