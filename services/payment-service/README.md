# Payment Service

A FastAPI-based microservice for processing payments in a food delivery platform.

## Features

- **Payment Processing**: Simulated payment processing with 80% success rate
- **Event-Driven**: Consumes order events and publishes payment events via RabbitMQ
- **Database**: MySQL for persistent payment records
- **REST API**: FastAPI with automatic OpenAPI documentation
- **Health Checks**: Built-in health endpoint for Kubernetes

## Tech Stack

- Python 3.11
- FastAPI
- SQLAlchemy ORM
- MySQL
- RabbitMQ (Pika)
- Pydantic
- Uvicorn

## Project Structure

```
app/
├── main.py              # FastAPI application entry point
├── api/
│   └── payments.py      # Payment endpoints
├── models/
│   └── payment.py       # Payment database model
├── db/
│   └── session.py       # Database session management
├── messaging/
│   └── publisher.py     # RabbitMQ event publisher
├── consumer.py          # RabbitMQ event consumer
└── core/
    └── config.py        # Configuration settings
```

## Database Schema

**payments** table:
- `id` (UUID, Primary Key)
- `order_id` (String, Indexed)
- `amount` (Decimal)
- `status` (Enum: PENDING, SUCCESS, FAILED)
- `method` (Enum: CARD, CASH, SIMULATED)
- `created_at` (DateTime)

## API Endpoints

### POST /payments
Create a new payment

**Request:**
```json
{
  "order_id": "order-123",
  "amount": 100.50,
  "payment_method": "SIMULATED"
}
```

**Response:**
```json
{
  "payment_id": "uuid",
  "order_id": "order-123",
  "amount": 100.50,
  "status": "SUCCESS",
  "method": "SIMULATED",
  "created_at": "2024-01-01T12:00:00"
}
```

### GET /payments/{payment_id}
Get payment details

### GET /health
Health check endpoint

### GET /docs
Swagger UI documentation

## Events

### Consumed Events
- `order.created` / `orders.created` - Automatically processes payment when order is created

### Published Events
- `payment.success` - Payment processed successfully
- `payment.failed` - Payment processing failed

**Event Payload:**
```json
{
  "payment_id": "uuid",
  "order_id": "order-123",
  "status": "SUCCESS",
  "amount": 100.50,
  "timestamp": "2024-01-01T12:00:00"
}
```

## Setup

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables (copy from .env.example):
```bash
cp .env.example .env
```

3. Run the service:
```bash
uvicorn app.main:app --reload --port 8003
```

4. Run the consumer (in separate terminal):
```bash
python -m app.consumer
```

### Docker Compose

Run the complete stack (service + MySQL + RabbitMQ):

```bash
docker-compose up -d
```

Access:
- API: http://localhost:8003
- Swagger UI: http://localhost:8003/docs
- RabbitMQ Management: http://localhost:15672 (guest/guest)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | MySQL connection string | mysql+pymysql://root:password@localhost:3306/payment_db |
| RABBITMQ_URL | RabbitMQ connection URL | amqp://guest:guest@localhost:5672/ |
| RABBITMQ_EXCHANGE | RabbitMQ exchange name | food_delivery |
| RABBITMQ_QUEUE | RabbitMQ queue name | payment_queue |
| SERVICE_NAME | Service identifier | payment-service |
| SERVICE_PORT | Service port | 8003 |

## Kubernetes Deployment

The service is designed to run in Kubernetes with:
- MySQL as a StatefulSet or external managed database
- RabbitMQ as a StatefulSet or external message broker
- ConfigMaps for configuration
- Secrets for sensitive data

## Testing

Test the API:

```bash
# Create payment
curl -X POST http://localhost:8003/payments \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order-123",
    "amount": 100.50,
    "payment_method": "SIMULATED"
  }'

# Get payment
curl http://localhost:8003/payments/{payment_id}

# Health check
curl http://localhost:8003/health
```

## Architecture Notes

- **Database Isolation**: Payment service has its own MySQL database
- **Event-Driven**: No direct API calls to other services
- **Idempotency**: Payment records are unique per order
- **Simulation**: 80% success rate for demonstration purposes
- **Scalability**: Stateless design allows horizontal scaling
