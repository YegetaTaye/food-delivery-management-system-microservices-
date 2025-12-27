#!/usr/bin/env python3
"""
Test script to publish order.created events to RabbitMQ
This simulates the Order Service publishing events
"""

import pika
import json
import sys
from datetime import datetime

RABBITMQ_URL = "amqp://guest:guest@localhost:5672/"
EXCHANGE = "food_delivery"


def publish_order_created_event(order_id: str, amount: float):
    """Publish an order.created event"""
    
    try:
        parameters = pika.URLParameters(RABBITMQ_URL)
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        
        # Declare exchange
        channel.exchange_declare(
            exchange=EXCHANGE,
            exchange_type='topic',
            durable=True
        )
        
        # Prepare event payload
        event_payload = {
            "order_id": order_id,
            "total_amount": amount,
            "customer_id": "customer-123",
            "restaurant_id": "restaurant-456",
            "status": "PENDING",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Publish message
        channel.basic_publish(
            exchange=EXCHANGE,
            routing_key="order_created",
            body=json.dumps(event_payload),
            properties=pika.BasicProperties(
                delivery_mode=2,
                content_type='application/json'
            )
        )
        
        print(f"✓ Published order.created event for order: {order_id}")
        print(f"  Amount: ${amount}")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"✗ Failed to publish event: {e}")
        return False


if __name__ == "__main__":
    print("=== Order Event Publisher (Test) ===\n")
    
    if len(sys.argv) > 1:
        order_id = sys.argv[1]
        amount = float(sys.argv[2]) if len(sys.argv) > 2 else 100.0
        publish_order_created_event(order_id, amount)
    else:
        # Publish multiple test events
        test_orders = [
            ("order-001", 50.00),
            ("order-002", 75.50),
            ("order-003", 120.00),
            ("order-004", 35.25),
            ("order-005", 200.00),
        ]
        
        print("Publishing test order events...\n")
        for order_id, amount in test_orders:
            publish_order_created_event(order_id, amount)
            print()
        
        print("\nCheck the payment-service consumer logs to see payment processing!")
        print("You can also query the payments via: curl http://localhost:8003/payments/{payment_id}")
