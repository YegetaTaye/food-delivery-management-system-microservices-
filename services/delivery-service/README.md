# Delivery Service

A lightweight MVP microservice for simulating delivery assignment and tracking in a distributed food delivery system.

## Overview

The Delivery Service is responsible for:
- Listening to order-related events from RabbitMQ
- Creating and updating delivery records
- Exposing REST APIs to query and update delivery status

## Architecture

This service is part of an event-driven microservices architecture:

```
┌─────────────────┐     order.created      ┌──────────────────┐
│  Order Service  │ ─────────────────────► │ Delivery Service │
└─────────────────┘     order.cancelled    └──────────────────┘
                                                    │
                                                    │ delivery.status.updated
                                                    ▼
                                           ┌──────────────────┐
                                           │  Other Services  │
                                           └──────────────────┘
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript (strict mode)
- **Database**: MySQL (service-owned)
- **Message Broker**: RabbitMQ
- **API Documentation**: Swagger (OpenAPI 3.0)
- **Logging**: Winston

## Events

### Consumed Events (via RabbitMQ)

| Event | Routing Key | Action |
|-------|-------------|--------|
| Order Created | `order.created` | Create delivery with status `ASSIGNED` |
| Order Cancelled | `order.cancelled` | Update delivery status to `CANCELLED` |

### Published Events (to RabbitMQ)

| Event | Routing Key | Trigger |
|-------|-------------|---------|
| Delivery Status Updated | `delivery.status.updated` | When delivery status changes |

**Exchange**: `order.events` (direct)

## Database Schema

```sql
CREATE TABLE delivery (
  id VARCHAR(36) PRIMARY KEY,
  orderId VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'ASSIGNED',
  assignedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orderId (orderId),
  INDEX idx_status (status)
);
```

## Delivery Status Flow

```
┌──────────┐     ┌────────────┐     ┌───────────┐
│ ASSIGNED │ ──► │ IN_TRANSIT │ ──► │ DELIVERED │
└──────────┘     └────────────┘     └───────────┘
     │                 │
     │                 │
     ▼                 ▼
┌───────────────────────┐
│      CANCELLED        │
└───────────────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/deliveries` | List all deliveries (limit 100) |
| GET | `/deliveries/:orderId` | Get delivery by order ID |
| PATCH | `/deliveries/:orderId/status` | Update delivery status |
| GET | `/docs` | Swagger API documentation |

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- RabbitMQ 3.x

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4500` |
| `NODE_ENV` | Environment | `development` |
| `SERVICE_NAME` | Service identifier | `delivery-service` |
| `MYSQL_HOST` | MySQL host | `localhost` |
| `MYSQL_PORT` | MySQL port | `3306` |
| `MYSQL_USER` | MySQL username | `root` |
| `MYSQL_PASSWORD` | MySQL password | - |
| `MYSQL_DATABASE` | MySQL database name | `delivery_db` |
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://localhost:5672` |

### Running the Service

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Production mode
npm start
```

### Docker

```bash
# Build image
docker build -t delivery-service .

# Run container
docker run -d \
  -p 4500:4500 \
  -e MYSQL_HOST=host.docker.internal \
  -e MYSQL_PASSWORD=your_password \
  -e RABBITMQ_URL=amqp://host.docker.internal:5672 \
  delivery-service
```

## API Examples

### Get Delivery by Order ID

```bash
curl http://localhost:4500/deliveries/order-123
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderId": "order-123",
    "status": "ASSIGNED",
    "assignedAt": "2025-12-27T10:00:00.000Z",
    "updatedAt": "2025-12-27T10:00:00.000Z"
  }
}
```

### Update Delivery Status

```bash
curl -X PATCH http://localhost:4500/deliveries/order-123/status \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_TRANSIT"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderId": "order-123",
    "status": "IN_TRANSIT",
    "assignedAt": "2025-12-27T10:00:00.000Z",
    "updatedAt": "2025-12-27T10:30:00.000Z"
  },
  "message": "Delivery status updated to IN_TRANSIT"
}
```

## Project Structure

```
src/
├── index.ts                 # Application entry point
├── app.ts                   # Express app configuration
├── config/
│   ├── env.ts              # Environment configuration
│   ├── db.ts               # MySQL connection
│   ├── rabbitmq.ts         # RabbitMQ connection
│   └── swagger.ts          # Swagger configuration
├── routes/
│   ├── health.route.ts     # Health check route
│   └── delivery.routes.ts  # Delivery API routes
├── controllers/
│   ├── health.controller.ts
│   └── delivery.controller.ts
├── services/
│   └── delivery.service.ts # Business logic
├── events/
│   ├── consumer.ts         # RabbitMQ event consumer
│   └── publisher.ts        # RabbitMQ event publisher
├── types/
│   ├── AppError.ts
│   └── delivery.types.ts   # TypeScript interfaces
├── middlewares/
│   └── error.middleware.ts
└── utils/
    └── logger.ts           # Winston logger
```

## License

ISC
