import pika
import json
from datetime import datetime
from app.core.config import settings
from app.models.payment import Payment


def get_rabbitmq_connection():
    """Create RabbitMQ connection"""
    try:
        parameters = pika.URLParameters(settings.RABBITMQ_URL)
        connection = pika.BlockingConnection(parameters)
        return connection
    except Exception as e:
        print(f"Failed to connect to RabbitMQ: {e}")
        return None


def publish_payment_event(event_type: str, payment: Payment):
    """Publish payment event to RabbitMQ"""
    
    connection = get_rabbitmq_connection()
    if not connection:
        print("Skipping event publishing - RabbitMQ not available")
        return
    
    try:
        channel = connection.channel()
        
        # Declare exchange
        channel.exchange_declare(
            exchange=settings.RABBITMQ_EXCHANGE,
            exchange_type='topic',
            durable=True
        )
        
        # Prepare event payload matching specification
        event_payload = {
            "payment_id": payment.id,
            "order_id": payment.order_id,
            "status": payment.status.value,
            "amount": float(payment.amount),
            "timestamp": payment.created_at.isoformat()
        }
        
        # Publish message with both dot and underscore routing keys for compatibility
        routing_key = event_type.replace(".", "_")
        channel.basic_publish(
            exchange=settings.RABBITMQ_EXCHANGE,
            routing_key=routing_key,
            body=json.dumps(event_payload),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Make message persistent
                content_type='application/json'
            )
        )
        
        print(f"Published event: {event_type} for payment {payment.id}")
        
    except Exception as e:
        print(f"Failed to publish event: {e}")
    finally:
        if connection:
            connection.close()
