# Payment Service API Documentation

## Base URL

```
http://localhost:8003
```

## Authentication

Currently no authentication required (internal microservice).

## Content Type

All requests and responses use `application/json`.

---

## Endpoints

### 1. Health Check

Check if the service is running and healthy.

**Endpoint:** `GET /health`

**Response:**

```json
{
  "status": "healthy",
  "service": "payment-service"
}
```

**Status Codes:**
- `200 OK` - Service is healthy

**Example:**

```bash
curl http://localhost:8003/health
```

---

### 2. Root Endpoint

Get service information.

**Endpoint:** `GET /`

**Response:**

```json
{
  "service": "payment-service",
  "version": "1.0.0",
  "docs": "/docs"
}
```

**Status Codes:**
- `200 OK` - Success

**Example:**

```bash
curl http://localhost:8003/
```

---

### 3. Create Payment

Process a payment for an order.

**Endpoint:** `POST /payments`

**Request Body:**

```json
{
  "order_id": "string",
  "amount": 0.0,
  "payment_method": "SIMULATED"
}
```

**Parameters:**

| Field          | Type   | Required | Description                           |
|----------------|--------|----------|---------------------------------------|
| order_id       | string | Yes      | Unique order identifier               |
| amount         | number | Yes      | Payment amount (must be > 0)          |
| payment_method | enum   | No       | Payment method: CARD, CASH, SIMULATED |

**Response:**

```json
{
  "payment_id": "550e8400-e29b-41d4-a716-446655440000",
  "order_id": "order-123",
  "amount": 100.50,
  "status": "SUCCESS",
  "method": "SIMULATED",
  "created_at": "2024-01-01T12:00:00"
}
```

**Status Codes:**
- `201 Created` - Payment processed successfully
- `422 Unprocessable Entity` - Invalid request data

**Payment Status:**
- `SUCCESS` - Payment processed successfully (80% probability)
- `FAILED` - Payment failed (20% probability)

**Examples:**

```bash
# Successful payment
curl -X POST http://localhost:8003/payments \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order-123",
    "amount": 100.50,
    "payment_method": "SIMULATED"
  }'

# Payment with CARD method
curl -X POST http://localhost:8003/payments \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order-456",
    "amount": 75.00,
    "payment_method": "CARD"
  }'

# Payment with CASH method
curl -X POST http://localhost:8003/payments \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order-789",
    "amount": 50.25,
    "payment_method": "CASH"
  }'
```

**Response Examples:**

Success:
```json
{
  "payment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "order_id": "order-123",
  "amount": 100.50,
  "status": "SUCCESS",
  "method": "SIMULATED",
  "created_at": "2024-01-01T12:34:56"
}
```

Failure:
```json
{
  "payment_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "order_id": "order-456",
  "amount": 75.00,
  "status": "FAILED",
  "method": "CARD",
  "created_at": "2024-01-01T12:35:10"
}
```

Validation Error:
```json
{
  "detail": [
    {
      "loc": ["body", "amount"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

---

### 4. Get Payment

Retrieve payment details by ID.

**Endpoint:** `GET /payments/{payment_id}`

**Path Parameters:**

| Parameter  | Type   | Required | Description           |
|------------|--------|----------|-----------------------|
| payment_id | string | Yes      | UUID of the payment   |

**Response:**

```json
{
  "payment_id": "550e8400-e29b-41d4-a716-446655440000",
  "order_id": "order-123",
  "amount": 100.50,
  "status": "SUCCESS",
  "method": "SIMULATED",
  "created_at": "2024-01-01T12:00:00"
}
```

**Status Codes:**
- `200 OK` - Payment found
- `404 Not Found` - Payment not found

**Examples:**

```bash
# Get payment by ID
curl http://localhost:8003/payments/a1b2c3d4-e5f6-7890-abcd-ef1234567890

# Using jq for pretty output
curl http://localhost:8003/payments/a1b2c3d4-e5f6-7890-abcd-ef1234567890 | jq .
```

**Response Examples:**

Success:
```json
{
  "payment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "order_id": "order-123",
  "amount": 100.50,
  "status": "SUCCESS",
  "method": "SIMULATED",
  "created_at": "2024-01-01T12:34:56"
}
```

Not Found:
```json
{
  "detail": "Payment not found"
}
```

---

### 5. API Documentation (Swagger UI)

Interactive API documentation with try-it-out functionality.

**Endpoint:** `GET /docs`

**Access:** Open in browser: http://localhost:8003/docs

**Features:**
- Interactive API explorer
- Request/response schemas
- Try out endpoints directly
- Authentication testing
- Model definitions

---

## Data Models

### PaymentRequest

```json
{
  "order_id": "string",
  "amount": 0.0,
  "payment_method": "SIMULATED"
}
```

**Validation Rules:**
- `order_id`: Required, non-empty string
- `amount`: Required, must be greater than 0
- `payment_method`: Optional, must be one of: CARD, CASH, SIMULATED (default: SIMULATED)

### PaymentResponse

```json
{
  "payment_id": "uuid",
  "order_id": "string",
  "amount": 0.0,
  "status": "SUCCESS",
  "method": "SIMULATED",
  "created_at": "ISO-8601 datetime"
}
```

**Field Descriptions:**
- `payment_id`: Unique UUID identifier for the payment
- `order_id`: Reference to the order
- `amount`: Payment amount (decimal with 2 decimal places)
- `status`: Payment status (PENDING, SUCCESS, FAILED)
- `method`: Payment method used (CARD, CASH, SIMULATED)
- `created_at`: Timestamp when payment was created (ISO-8601 format)

---

## Enums

### PaymentStatus

- `PENDING` - Payment is being processed
- `SUCCESS` - Payment completed successfully
- `FAILED` - Payment failed

### PaymentMethod

- `CARD` - Credit/debit card payment
- `CASH` - Cash payment
- `SIMULATED` - Simulated payment (for testing)

---

## Error Responses

### 400 Bad Request

Invalid request format.

```json
{
  "detail": "Invalid request"
}
```

### 404 Not Found

Resource not found.

```json
{
  "detail": "Payment not found"
}
```

### 422 Unprocessable Entity

Validation error.

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "error message",
      "type": "error_type"
    }
  ]
}
```

### 500 Internal Server Error

Server error.

```json
{
  "detail": "Internal server error"
}
```

---

## Events

The Payment Service publishes events to RabbitMQ when payments are processed.

### payment.success

Published when a payment is successful.

**Routing Key:** `payment_success`

**Payload:**

```json
{
  "payment_id": "uuid",
  "order_id": "string",
  "status": "SUCCESS",
  "amount": 100.50,
  "timestamp": "2024-01-01T12:00:00"
}
```

### payment.failed

Published when a payment fails.

**Routing Key:** `payment_failed`

**Payload:**

```json
{
  "payment_id": "uuid",
  "order_id": "string",
  "status": "FAILED",
  "amount": 100.50,
  "timestamp": "2024-01-01T12:00:00"
}
```

---

## Rate Limiting

Currently no rate limiting implemented.

**Recommendation for Production:**
- Implement rate limiting per IP/API key
- Suggested limit: 100 requests per minute

---

## Pagination

Currently not implemented as payments are retrieved individually by ID.

**Future Enhancement:**
- Add `GET /payments?page=1&limit=10` for listing payments
- Add filtering by order_id, status, date range

---

## Testing

### Using cURL

```bash
# Create payment
curl -X POST http://localhost:8003/payments \
  -H "Content-Type: application/json" \
  -d '{"order_id": "test-001", "amount": 99.99, "payment_method": "SIMULATED"}'

# Get payment
curl http://localhost:8003/payments/{payment_id}

# Health check
curl http://localhost:8003/health
```

### Using HTTPie

```bash
# Create payment
http POST http://localhost:8003/payments \
  order_id=test-001 \
  amount=99.99 \
  payment_method=SIMULATED

# Get payment
http GET http://localhost:8003/payments/{payment_id}
```

### Using Python Requests

```python
import requests

# Create payment
response = requests.post(
    "http://localhost:8003/payments",
    json={
        "order_id": "test-001",
        "amount": 99.99,
        "payment_method": "SIMULATED"
    }
)
print(response.json())

# Get payment
payment_id = response.json()["payment_id"]
response = requests.get(f"http://localhost:8003/payments/{payment_id}")
print(response.json())
```

### Using JavaScript Fetch

```javascript
// Create payment
fetch('http://localhost:8003/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    order_id: 'test-001',
    amount: 99.99,
    payment_method: 'SIMULATED'
  })
})
.then(response => response.json())
.then(data => console.log(data));

// Get payment
fetch('http://localhost:8003/payments/{payment_id}')
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## Postman Collection

Import this collection into Postman:

```json
{
  "info": {
    "name": "Payment Service",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:8003/health"
      }
    },
    {
      "name": "Create Payment",
      "request": {
        "method": "POST",
        "url": "http://localhost:8003/payments",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"order_id\": \"order-123\",\n  \"amount\": 100.50,\n  \"payment_method\": \"SIMULATED\"\n}"
        }
      }
    },
    {
      "name": "Get Payment",
      "request": {
        "method": "GET",
        "url": "http://localhost:8003/payments/{{payment_id}}"
      }
    }
  ]
}
```

---

## OpenAPI Specification

The full OpenAPI 3.0 specification is available at:

```
http://localhost:8003/openapi.json
```

Download and use with any OpenAPI-compatible tool.

---

## Support

For issues or questions:
- Check service logs: `docker-compose logs -f payment-service`
- View Swagger UI: http://localhost:8003/docs
- Review SETUP.md for configuration help
- Check ARCHITECTURE.md for design details
