# Payment Service Architecture

## Overview

The Payment Service is a microservice responsible for processing payments in a food delivery platform. It follows event-driven architecture principles and maintains complete database isolation.

## Architecture Principles

### 1. Database Isolation
- Payment Service has its own MySQL database (`payment_db`)
- No direct access to other services' databases
- All data sharing happens through events

### 2. Event-Driven Communication
- **Consumes**: `order.created` events from Order Service
- **Publishes**: `payment.success` and `payment.failed` events
- Uses RabbitMQ with topic exchange for routing

### 3. Stateless Design
- No session state stored in application
- All state persisted in MySQL
- Horizontally scalable

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Payment Service                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   FastAPI    │         │   Consumer   │                  │
│  │   (REST)     │         │  (RabbitMQ)  │                  │
│  └──────┬───────┘         └──────┬───────┘                  │
│         │                        │                           │
│         │                        │                           │
│         ▼                        ▼                           │
│  ┌─────────────────────────────────────┐                    │
│  │         Business Logic               │                    │
│  │  - Payment Processing                │                    │
│  │  - Simulation (80% success)          │                    │
│  │  - Event Publishing                  │                    │
│  └─────────────┬───────────────────────┘                    │
│                │                                              │
│                ▼                                              │
│  ┌─────────────────────────────────────┐                    │
│  │      SQLAlchemy ORM                  │                    │
│  └─────────────┬───────────────────────┘                    │
│                │                                              │
└────────────────┼──────────────────────────────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │    MySQL     │
         │  payment_db  │
         └──────────────┘
```

## Data Flow

### 1. Manual Payment Request (REST API)
```
Client → POST /payments → Payment Service → MySQL
                              ↓
                         RabbitMQ (publish event)
```

### 2. Automatic Payment (Event-Driven)
```
Order Service → order.created event → RabbitMQ
                                         ↓
                                   Payment Consumer
                                         ↓
                                   Process Payment
                                         ↓
                                      MySQL
                                         ↓
                                   Publish Result
                                         ↓
                                     RabbitMQ
```

## Database Schema

### payments Table

| Column     | Type         | Constraints           | Description                    |
|------------|--------------|----------------------|--------------------------------|
| id         | CHAR(36)     | PRIMARY KEY          | UUID v4                        |
| order_id   | VARCHAR(255) | NOT NULL, INDEX      | Reference to order             |
| amount     | DECIMAL(10,2)| NOT NULL             | Payment amount                 |
| status     | ENUM         | NOT NULL             | PENDING, SUCCESS, FAILED       |
| method     | ENUM         | NOT NULL             | CARD, CASH, SIMULATED          |
| created_at | DATETIME     | NOT NULL, DEFAULT NOW| Timestamp                      |

**Indexes:**
- Primary Key: `id`
- Index: `order_id` (for fast lookups)

## Event Specifications

### Consumed Events

#### order.created
```json
{
  "order_id": "string",
  "total_amount": 100.50,
  "customer_id": "string",
  "restaurant_id": "string",
  "status": "PENDING",
  "timestamp": "2024-01-01T12:00:00"
}
```

**Routing Key**: `order_created` or `orders_created`

**Action**: Automatically create and process payment

### Published Events

#### payment.success
```json
{
  "payment_id": "uuid",
  "order_id": "string",
  "status": "SUCCESS",
  "amount": 100.50,
  "timestamp": "2024-01-01T12:00:00"
}
```

**Routing Key**: `payment_success`

#### payment.failed
```json
{
  "payment_id": "uuid",
  "order_id": "string",
  "status": "FAILED",
  "amount": 100.50,
  "timestamp": "2024-01-01T12:00:00"
}
```

**Routing Key**: `payment_failed`

## API Endpoints

### POST /payments
Create and process a payment

**Request:**
```json
{
  "order_id": "order-123",
  "amount": 100.50,
  "payment_method": "SIMULATED"
}
```

**Response (201):**
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
Retrieve payment details

**Response (200):**
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

**Response (404):**
```json
{
  "detail": "Payment not found"
}
```

### GET /health
Health check for Kubernetes

**Response (200):**
```json
{
  "status": "healthy",
  "service": "payment-service"
}
```

## Payment Simulation

The service simulates payment processing with:
- **80% success rate** (configurable in code)
- Random SUCCESS/FAILED status
- Immediate processing (no delays)

**Purpose**: Demonstrate workflow without real payment gateway integration

## Configuration

All configuration via environment variables:

| Variable          | Required | Default                                      | Description              |
|-------------------|----------|----------------------------------------------|--------------------------|
| DATABASE_URL      | Yes      | mysql+pymysql://root:password@localhost:3306/payment_db | MySQL connection |
| RABBITMQ_URL      | Yes      | amqp://guest:guest@localhost:5672/          | RabbitMQ connection      |
| RABBITMQ_EXCHANGE | No       | food_delivery                                | Exchange name            |
| RABBITMQ_QUEUE    | No       | payment_queue                                | Queue name               |
| SERVICE_NAME      | No       | payment-service                              | Service identifier       |
| SERVICE_PORT      | No       | 8003                                         | HTTP port                |

## Deployment

### Docker
```bash
docker build -t payment-service:latest .
docker run -p 8003:8003 \
  -e DATABASE_URL=mysql+pymysql://... \
  -e RABBITMQ_URL=amqp://... \
  payment-service:latest
```

### Kubernetes
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

**Note**: The deployment includes two containers:
1. `payment-service` - FastAPI REST API
2. `payment-consumer` - RabbitMQ event consumer

## Scalability

### Horizontal Scaling
- REST API: Scale to N replicas
- Consumer: Scale to N replicas (RabbitMQ distributes messages)
- Database: Single MySQL instance (can use read replicas)

### Performance Considerations
- Connection pooling for MySQL
- Persistent RabbitMQ connections
- Stateless design allows unlimited scaling

## Error Handling

### Database Errors
- Connection failures: Retry with exponential backoff
- Transaction failures: Rollback and log error

### RabbitMQ Errors
- Connection failures: Log and continue (graceful degradation)
- Message processing errors: NACK and move to DLQ

### API Errors
- 400: Invalid request data
- 404: Payment not found
- 500: Internal server error

## Monitoring

### Health Checks
- Kubernetes liveness probe: `/health`
- Kubernetes readiness probe: `/health`

### Metrics (Future)
- Payment success rate
- Processing time
- Event throughput
- Database connection pool usage

## Security

### Current Implementation
- No authentication (internal service)
- CORS enabled for development
- SQL injection protection via ORM

### Production Recommendations
- Add service-to-service authentication
- Implement rate limiting
- Add request validation
- Enable TLS for RabbitMQ
- Use secrets management (Vault, AWS Secrets Manager)

## Testing

### Unit Tests
```bash
pytest tests/unit/
```

### Integration Tests
```bash
pytest tests/integration/
```

### Manual Testing
```bash
# Test REST API
./test_api.sh

# Test event consumption
python test_events.py
```

## Future Enhancements

1. **Real Payment Gateway Integration**
   - Stripe, PayPal, etc.
   - Webhook handling
   - Refund support

2. **Advanced Features**
   - Payment retries
   - Idempotency keys
   - Payment history
   - Fraud detection

3. **Observability**
   - Prometheus metrics
   - Distributed tracing (Jaeger)
   - Structured logging (ELK stack)

4. **Resilience**
   - Circuit breakers
   - Retry policies
   - Dead letter queues
   - Saga pattern for distributed transactions
