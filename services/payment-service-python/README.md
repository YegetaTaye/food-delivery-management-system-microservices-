# Payment Service (Python)

A FastAPI-based microservice for processing payments in a food delivery system. This service simulates payment processing and communicates with other services via RabbitMQ events.

## Overview

The Payment Service is responsible for:

- Processing payment requests for orders
- Storing payment records in MySQL
- Publishing payment result events to RabbitMQ
- Consuming order events and processing payments automatically

## Architecture

```
┌─────────────────┐     order.created      ┌───────────────────────┐
│  Order Service  │ ─────────────────────► │                       │
└─────────────────┘                        │   Payment Service     │
                                           │                       │
                    payment.success        │   ┌───────────────┐   │
                    payment.failed         │   │    MySQL      │   │
                  ◄──────────────────────  │   │  (SQLAlchemy) │   │
                                           │   └───────────────┘   │
                                           └───────────────────────┘
```

## Tech Stack

- **Runtime**: Python 3.11
- **Framework**: FastAPI
- **Database**: MySQL with SQLAlchemy ORM
- **Message Broker**: RabbitMQ (aio-pika)
- **Validation**: Pydantic
- **Server**: Uvicorn
- **API Documentation**: Swagger (auto-generated)

## Database Schema

```sql
CREATE TABLE payments (
    id          CHAR(36) PRIMARY KEY,
    order_id    VARCHAR(255) NOT NULL,
    amount      DECIMAL(10, 2) NOT NULL,
    status      ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL,
    method      ENUM('CARD', 'CASH', 'SIMULATED') NOT NULL,
    created_at  DATETIME NOT NULL
);
```

## API Endpoints

| Method | Endpoint              | Description                  |
| ------ | --------------------- | ---------------------------- |
| GET    | `/health`             | Health check                 |
| POST   | `/payments`           | Create and process a payment |
| GET    | `/payments/{id}`      | Get payment by ID            |
| GET    | `/docs`               | Swagger API documentation    |
| GET    | `/redoc`              | ReDoc API documentation      |

## RabbitMQ Integration

### Consumed Events

| Event           | Routing Key     | Description                     |
| --------------- | --------------- | ------------------------------- |
| Order Created   | `order.created` | Triggers automatic payment      |

### Published Events

| Event           | Routing Key       | Description                    |
| --------------- | ----------------- | ------------------------------ |
| Payment Success | `payment.success` | Payment completed successfully |
| Payment Failed  | `payment.failed`  | Payment processing failed      |

### Event Payload Example

```json
{
  "payment_id": "550e8400-e29b-41d4-a716-446655440000",
  "order_id": "order-123",
  "status": "SUCCESS",
  "amount": 100.50,
  "timestamp": "2025-12-27T10:00:00.000Z"
}
```

## Getting Started

### Prerequisites

- Python 3.11+
- MySQL 8.0+
- RabbitMQ 3.x

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### Environment Variables

| Variable          | Description              | Default              |
| ----------------- | ------------------------ | -------------------- |
| `SERVICE_NAME`    | Service identifier       | `payment-service`    |
| `PORT`            | Server port              | `4600`               |
| `DEBUG`           | Enable debug mode        | `false`              |
| `MYSQL_HOST`      | MySQL host               | `localhost`          |
| `MYSQL_PORT`      | MySQL port               | `3306`               |
| `MYSQL_USER`      | MySQL username           | `root`               |
| `MYSQL_PASSWORD`  | MySQL password           | `password`           |
| `MYSQL_DATABASE`  | MySQL database name      | `payment_db`         |
| `RABBITMQ_HOST`   | RabbitMQ host            | `localhost`          |
| `RABBITMQ_PORT`   | RabbitMQ port            | `5672`               |
| `RABBITMQ_USER`   | RabbitMQ username        | `guest`              |
| `RABBITMQ_PASSWORD` | RabbitMQ password      | `guest`              |

### Running the Service

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 4600

# Or using Python directly
python -m app.main

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 4600 --workers 4
```

### Docker

```bash
# Build image
docker build -t payment-service-python .

# Run container
docker run -d \
  -p 4600:4600 \
  -e MYSQL_HOST=host.docker.internal \
  -e MYSQL_PASSWORD=password \
  -e RABBITMQ_HOST=host.docker.internal \
  payment-service-python
```

## API Examples

### Create a Payment

```bash
curl -X POST http://localhost:4600/payments \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order-123",
    "amount": 99.99,
    "payment_method": "SIMULATED"
  }'
```

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "order_id": "order-123",
  "amount": 99.99,
  "status": "SUCCESS",
  "method": "SIMULATED",
  "created_at": "2025-12-27T10:00:00"
}
```

### Get Payment by ID

```bash
curl http://localhost:4600/payments/550e8400-e29b-41d4-a716-446655440000
```

### Health Check

```bash
curl http://localhost:4600/health
```

Response:

```json
{
  "status": "ok",
  "service": "payment-service",
  "version": "1.0.0",
  "timestamp": "2025-12-27T10:00:00"
}
```

## Project Structure

```
payment-service-python/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── api/
│   │   ├── __init__.py
│   │   ├── health.py           # Health check endpoint
│   │   └── payments.py         # Payment endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py           # Configuration settings
│   ├── db/
│   │   ├── __init__.py
│   │   └── session.py          # Database session management
│   ├── messaging/
│   │   ├── __init__.py
│   │   ├── consumer.py         # RabbitMQ event consumer
│   │   └── publisher.py        # RabbitMQ event publisher
│   ├── models/
│   │   ├── __init__.py
│   │   └── payment.py          # SQLAlchemy models
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── payment.py          # Pydantic schemas
│   └── services/
│       ├── __init__.py
│       └── payment_service.py  # Business logic
├── .env.example
├── .dockerignore
├── .gitignore
├── Dockerfile
├── README.md
└── requirements.txt
```

## Payment Simulation

The service simulates payment processing with:

- **80% success rate**: Most payments succeed
- **20% failure rate**: Some payments fail randomly

This is intentional for demonstrating system workflow and error handling.

## Architecture Rules

- ✅ Payment Service has its own MySQL database
- ✅ No direct access to other services' databases
- ✅ Communication is event-driven via RabbitMQ
- ✅ All configuration via environment variables
- ✅ Stateless design for horizontal scaling

## License

ISC

