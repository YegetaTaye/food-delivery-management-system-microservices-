# Payment Service Setup Guide

## Prerequisites

- Python 3.11+
- MySQL 8.0+
- RabbitMQ 3.x
- Docker & Docker Compose (optional)

## Quick Start (Docker Compose)

The fastest way to get started:

```bash
cd services/payment-service

# Start all services (MySQL, RabbitMQ, Payment Service)
docker-compose up -d

# View logs
docker-compose logs -f payment-service

# Stop all services
docker-compose down
```

Access:
- API: http://localhost:8003
- Swagger UI: http://localhost:8003/docs
- RabbitMQ Management: http://localhost:15672 (guest/guest)

## Local Development Setup

### 1. Install Python Dependencies

```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup MySQL

```bash
# Start MySQL (Docker)
docker run -d \
  --name payment-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=payment_db \
  -p 3306:3306 \
  mysql:8.0

# Or use existing MySQL
mysql -u root -p
CREATE DATABASE payment_db;
```

### 3. Setup RabbitMQ

```bash
# Start RabbitMQ (Docker)
docker run -d \
  --name payment-rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

### 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

Example `.env`:
```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/payment_db
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
RABBITMQ_EXCHANGE=food_delivery
RABBITMQ_QUEUE=payment_queue
SERVICE_NAME=payment-service
SERVICE_PORT=8003
```

### 5. Run the Service

**Terminal 1 - API Server:**
```bash
uvicorn app.main:app --reload --port 8003
```

**Terminal 2 - Event Consumer:**
```bash
python -m app.consumer
```

### 6. Verify Installation

```bash
# Check health
curl http://localhost:8003/health

# View API docs
open http://localhost:8003/docs
```

## Testing

### Test REST API

```bash
# Make script executable
chmod +x test_api.sh

# Run tests
./test_api.sh
```

### Test Event Processing

```bash
# Make script executable
chmod +x test_events.py

# Publish test events
python test_events.py

# Or publish specific order
python test_events.py order-123 150.00
```

### Manual API Testing

```bash
# Create payment
curl -X POST http://localhost:8003/payments \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order-123",
    "amount": 100.50,
    "payment_method": "SIMULATED"
  }'

# Get payment (replace {id} with actual payment_id)
curl http://localhost:8003/payments/{id}

# Health check
curl http://localhost:8003/health
```

## Database Management

### View Tables

```bash
mysql -u root -p payment_db

# Show tables
SHOW TABLES;

# View payments
SELECT * FROM payments;

# View payment by order
SELECT * FROM payments WHERE order_id = 'order-123';
```

### Reset Database

```bash
mysql -u root -p payment_db

# Drop all payments
TRUNCATE TABLE payments;

# Or drop and recreate
DROP DATABASE payment_db;
CREATE DATABASE payment_db;
```

The service will auto-create tables on startup.

## RabbitMQ Management

### Access Management UI

Open http://localhost:15672
- Username: `guest`
- Password: `guest`

### View Queues

Navigate to "Queues" tab to see:
- `payment_queue` - Consumer queue
- Message rates
- Consumer connections

### Publish Test Message

1. Go to "Exchanges" → `food_delivery`
2. Click "Publish message"
3. Routing key: `order_created`
4. Payload:
```json
{
  "order_id": "test-order-001",
  "total_amount": 99.99,
  "customer_id": "customer-123",
  "restaurant_id": "restaurant-456",
  "status": "PENDING",
  "timestamp": "2024-01-01T12:00:00"
}
```
5. Click "Publish message"
6. Check consumer logs for processing

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (minikube, kind, or cloud)
- kubectl configured
- Docker image built and pushed

### Build and Push Image

```bash
# Build image
docker build -t your-registry/payment-service:latest .

# Push to registry
docker push your-registry/payment-service:latest

# Update k8s/deployment.yaml with your image
```

### Deploy to Kubernetes

```bash
# Create namespace (optional)
kubectl create namespace food-delivery

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/payment-service
kubectl logs -f deployment/payment-consumer
```

### Access Service

```bash
# Port forward
kubectl port-forward service/payment-service 8003:8003

# Access API
curl http://localhost:8003/health
```

### Update Configuration

```bash
# Edit ConfigMap
kubectl edit configmap payment-service-config

# Edit Secret
kubectl edit secret payment-service-secrets

# Restart pods to pick up changes
kubectl rollout restart deployment/payment-service
kubectl rollout restart deployment/payment-consumer
```

## Troubleshooting

### Service Won't Start

**Check MySQL connection:**
```bash
# Test connection
mysql -h localhost -u root -p payment_db

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

**Check RabbitMQ connection:**
```bash
# Test connection
curl http://localhost:15672/api/overview

# Check RABBITMQ_URL in .env
echo $RABBITMQ_URL
```

### Consumer Not Processing Events

**Check RabbitMQ queue:**
1. Open http://localhost:15672
2. Go to "Queues"
3. Check if `payment_queue` exists
4. Check if consumer is connected

**Check consumer logs:**
```bash
# Docker Compose
docker-compose logs -f payment-service

# Local
# Check terminal running consumer
```

**Manually publish test event:**
```bash
python test_events.py
```

### Database Errors

**Connection refused:**
- Check MySQL is running: `docker ps | grep mysql`
- Check port: `netstat -an | grep 3306`
- Verify credentials in .env

**Table doesn't exist:**
- Service auto-creates tables on startup
- Check startup logs for errors
- Manually create: `python -c "from app.db.session import engine, Base; from app.models.payment import Payment; Base.metadata.create_all(bind=engine)"`

### API Errors

**404 Not Found:**
- Check URL path: `/payments` not `/payment`
- Verify payment_id is correct UUID

**422 Validation Error:**
- Check request body format
- Ensure `amount` is positive number
- Ensure `payment_method` is valid enum

**500 Internal Server Error:**
- Check service logs
- Verify database connection
- Check for missing environment variables

## Development Tips

### Hot Reload

Use `--reload` flag for auto-restart on code changes:
```bash
uvicorn app.main:app --reload --port 8003
```

### Debug Mode

Add print statements or use Python debugger:
```python
import pdb; pdb.set_trace()
```

### View SQL Queries

Enable SQLAlchemy logging in `app/db/session.py`:
```python
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,  # Add this line
    pool_pre_ping=True,
)
```

### Test Different Success Rates

Modify `simulate_payment()` in `app/api/payments.py`:
```python
def simulate_payment() -> PaymentStatus:
    # 50% success rate
    return PaymentStatus.SUCCESS if random.random() < 0.5 else PaymentStatus.FAILED
```

## Production Checklist

- [ ] Use production-grade MySQL (RDS, Cloud SQL, etc.)
- [ ] Use production-grade RabbitMQ (CloudAMQP, Amazon MQ, etc.)
- [ ] Store secrets in secure vault (AWS Secrets Manager, HashiCorp Vault)
- [ ] Enable TLS for database and RabbitMQ connections
- [ ] Add authentication/authorization
- [ ] Configure resource limits in Kubernetes
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Enable distributed tracing
- [ ] Set up backup and disaster recovery
- [ ] Configure auto-scaling policies
- [ ] Add rate limiting
- [ ] Enable CORS only for trusted origins
- [ ] Use connection pooling
- [ ] Implement circuit breakers
- [ ] Add health check dependencies (DB, RabbitMQ)

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pika Documentation](https://pika.readthedocs.io/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review this guide
3. Check ARCHITECTURE.md for design details
4. Review API docs: http://localhost:8003/docs
