import pika
import json
from decimal import Decimal
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.messaging.publisher import publish_payment_event
from app.api.payments import simulate_payment


def process_order_created(body: dict, db: Session):
    """Process order.created event"""
    
    order_id = body.get("order_id")
    amount = body.get("total_amount", body.get("amount", 0))
    
    if not order_id or not amount:
        print(f"Invalid order.created event: {body}")
        return
    
    print(f"Processing payment for order: {order_id}")
    
    # Simulate payment processing
    payment_status = simulate_payment()
    
    # Create payment record
    payment = Payment(
        order_id=order_id,
        amount=Decimal(str(amount)),
        status=payment_status,
        method=PaymentMethod.SIMULATED
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Publish result event
    event_type = "payment.success" if payment_status == PaymentStatus.SUCCESS else "payment.failed"
    publish_payment_event(event_type, payment)
    
    print(f"Payment {payment.id} processed with status: {payment_status.value}")


def callback(ch, method, properties, body):
    """RabbitMQ message callback"""
    
    db = SessionLocal()
    try:
        message = json.loads(body)
        routing_key = method.routing_key
        
        print(f"Received message on {routing_key}: {message}")
        
        if routing_key == "order_created" or routing_key == "orders_created":
            process_order_created(message, db)
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        print(f"Error processing message: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    finally:
        db.close()


def start_consumer():
    """Start RabbitMQ consumer"""
    
    try:
        parameters = pika.URLParameters(settings.RABBITMQ_URL)
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        
        # Declare exchange
        channel.exchange_declare(
            exchange=settings.RABBITMQ_EXCHANGE,
            exchange_type='topic',
            durable=True
        )
        
        # Declare queue
        channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True)
        
        # Bind queue to exchange with routing keys
        channel.queue_bind(
            exchange=settings.RABBITMQ_EXCHANGE,
            queue=settings.RABBITMQ_QUEUE,
            routing_key="order_created"
        )
        channel.queue_bind(
            exchange=settings.RABBITMQ_EXCHANGE,
            queue=settings.RABBITMQ_QUEUE,
            routing_key="orders_created"
        )
        
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(
            queue=settings.RABBITMQ_QUEUE,
            on_message_callback=callback
        )
        
        print(f"[*] Waiting for messages on queue: {settings.RABBITMQ_QUEUE}")
        channel.start_consuming()
        
    except KeyboardInterrupt:
        print("Consumer stopped by user")
    except Exception as e:
        print(f"Consumer error: {e}")


if __name__ == "__main__":
    start_consumer()
