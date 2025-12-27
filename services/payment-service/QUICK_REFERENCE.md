# Payment Service - Quick Reference

## 🚀 Quick Start

```bash
cd services/payment-service
docker-compose up -d
```

Access: http://localhost:8003/docs

## 📋 Common Commands

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f payment-service

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run API server
uvicorn app.main:app --reload --port 8003

# Run consumer (separate terminal)
python -m app.consumer
```

### Testing

```bash
# Test API
./test_api.sh

# Test events
python test_events.py

# Health check
curl http://localhost:8003/health
```

### Database

```bash
# Connect to MySQL
mysql -u root -p payment_db

# View payments
SELECT * FROM payments;

# Reset database
TRUNCATE TABLE payments;
```

## 🔌 API Endpoints

| Method | Endpoint           | Description       |
|--------|--------------------|-------------------|
| GET    | /health            | Health check      |
| GET    | /docs              | Swagger UI        |
| POST   | /payments          | Create payment    |
| GET    | /payments/{id}     | Get payment       |

## 📝 Create Payment

```bash
curl -X POST http://localhost:8003/payments \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order-123",
    "amount": 100.50,
    "payment_method": "SIMULATED"
  }'
```

## 🔍 Get Payment

```bash
curl http://localhost:8003/payments/{payment_id}
```

## 📊 Event Format

### Consumed: order.created

```json
{
  "order_id": "order-123",
  "total_amount": 100.50,
  "timestamp": "2024-01-01T12:00:00"
}
```

### Published: payment.success / payment.failed

```json
{
  "payment_id": "uuid",
  "order_id": "order-123",
  "status": "SUCCESS",
  "amount": 100.50,
  "timestamp": "2024-01-01T12:00:00"
}
```

## ⚙️ Environment Variables

```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/payment_db
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
RABBITMQ_EXCHANGE=food_delivery
RABBITMQ_QUEUE=payment_queue
SERVICE_PORT=8003
```

## 🐳 Docker

```bash
# Build image
docker build -t payment-service:latest .

# Run container
docker run -p 8003:8003 \
  -e DATABASE_URL=mysql+pymysql://... \
  -e RABBITMQ_URL=amqp://... \
  payment-service:latest
```

## ☸️ Kubernetes

```bash
# Deploy
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/payment-service

# Port forward
kubectl port-forward service/payment-service 8003:8003
```

## 🔧 Troubleshooting

### Service won't start
```bash
# Check MySQL
docker ps | grep mysql

# Check RabbitMQ
docker ps | grep rabbitmq

# Check logs
docker-compose logs payment-service
```

### Database connection error
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test MySQL connection
mysql -h localhost -u root -p
```

### RabbitMQ connection error
```bash
# Verify RABBITMQ_URL
echo $RABBITMQ_URL

# Check RabbitMQ management
open http://localhost:15672
```

## 📚 Documentation

- **README.md** - Overview and features
- **SETUP.md** - Detailed setup guide
- **API.md** - Complete API documentation
- **ARCHITECTURE.md** - Architecture details
- **REQUIREMENTS_CHECKLIST.md** - Requirements verification

## 🌐 URLs

- API: http://localhost:8003
- Swagger: http://localhost:8003/docs
- OpenAPI: http://localhost:8003/openapi.json
- RabbitMQ: http://localhost:15672 (guest/guest)

## 💡 Tips

- Use Swagger UI for interactive testing
- Check consumer logs for event processing
- RabbitMQ Management UI shows queue status
- Payment simulation: 80% success, 20% failure
- All timestamps in ISO-8601 format
- Payment IDs are UUIDs

## 🎯 Payment Methods

- `SIMULATED` - Default, for testing
- `CARD` - Credit/debit card
- `CASH` - Cash payment

## 📈 Payment Status

- `PENDING` - Processing
- `SUCCESS` - Completed (80% probability)
- `FAILED` - Failed (20% probability)

## 🔐 Security Notes

- No authentication (internal service)
- Use secrets management in production
- Enable TLS for RabbitMQ
- Restrict CORS origins
- Add rate limiting

## 📦 Dependencies

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pymysql==1.1.0
pika==1.3.2
pydantic==2.5.3
pydantic-settings==2.1.0
```

## 🎬 Demo Workflow

1. Start services: `docker-compose up -d`
2. Open Swagger: http://localhost:8003/docs
3. Create payment via API
4. Publish order event: `python test_events.py`
5. Check consumer logs for processing
6. Query payment via API
7. View RabbitMQ queues

## ✅ Health Check Response

```json
{
  "status": "healthy",
  "service": "payment-service"
}
```

## 🚨 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Connection refused | MySQL not running | Start MySQL |
| Queue not found | RabbitMQ not configured | Check consumer logs |
| 404 Not Found | Invalid payment ID | Verify UUID format |
| 422 Validation | Invalid request | Check request body |

## 📞 Support

Check logs first:
```bash
docker-compose logs -f payment-service
```

Then review documentation:
- SETUP.md for configuration
- API.md for endpoint details
- ARCHITECTURE.md for design
