# Notification Service

An event-driven notification service that listens to domain events and simulates sending notifications (log-based).

## Overview

The Notification Service is responsible for:
- Listening to domain events from RabbitMQ
- Simulating notification delivery (logging)
- Storing notifications in-memory for querying

## Architecture

```
┌─────────────────┐     order.created      ┌───────────────────────┐
│  Order Service  │ ─────────────────────► │                       │
└─────────────────┘   order.status.updated │  Notification Service │
                                           │                       │
┌─────────────────┐   payment.completed    │   (Logs notifications │
│ Payment Service │ ─────────────────────► │    to simulate send)  │
└─────────────────┘                        └───────────────────────┘
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript (strict mode)
- **Message Broker**: RabbitMQ
- **Storage**: In-memory (no database required)
- **API Documentation**: Swagger (OpenAPI 3.0)
- **Logging**: Winston

## Events Consumed

| Event | Routing Key | Action |
|-------|-------------|--------|
| Order Created | `order.created` | Notify user of new order |
| Order Status Updated | `order.status.updated` | Notify user of status change |
| Payment Completed | `payment.completed` | Notify user of successful payment |

**Exchange**: `order.events` (direct)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/notifications` | List all notifications |
| GET | `/notifications?userId=xxx` | Filter by user ID |
| GET | `/notifications?eventName=xxx` | Filter by event name |
| GET | `/notifications/stats` | Notification statistics |
| GET | `/docs` | Swagger API documentation |

## Getting Started

### Prerequisites

- Node.js 18+
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
| `PORT` | Server port | `4600` |
| `NODE_ENV` | Environment | `development` |
| `SERVICE_NAME` | Service identifier | `notification-service` |
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
docker build -t notification-service .

# Run container
docker run -d \
  -p 4600:4600 \
  -e RABBITMQ_URL=amqp://host.docker.internal:5672 \
  notification-service
```

## API Examples

### Get All Notifications

```bash
curl http://localhost:4600/notifications
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-123",
      "eventName": "order.created",
      "message": "Your order #order-456 has been created successfully! Total: $29.99",
      "metadata": {
        "orderId": "order-456",
        "total": 29.99
      },
      "createdAt": "2025-12-27T10:00:00.000Z"
    }
  ],
  "count": 1,
  "total": 1
}
```

### Get Notifications by User

```bash
curl "http://localhost:4600/notifications?userId=user-123"
```

### Get Notification Statistics

```bash
curl http://localhost:4600/notifications/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byEventType": {
      "order.created": 50,
      "order.status.updated": 80,
      "payment.completed": 20
    }
  }
}
```

## Project Structure

```
src/
├── index.ts                    # Application entry point
├── app.ts                      # Express app configuration
├── config/
│   ├── env.ts                 # Environment configuration
│   ├── rabbitmq.ts            # RabbitMQ connection
│   └── swagger.ts             # Swagger configuration
├── routes/
│   ├── health.route.ts        # Health check route
│   └── notification.routes.ts # Notification API routes
├── controllers/
│   ├── health.controller.ts
│   └── notification.controller.ts
├── services/
│   └── notification.store.ts  # In-memory notification store
├── messaging/
│   └── rabbitmq.consumer.ts   # Event consumer
├── types/
│   └── notification.types.ts  # TypeScript interfaces
├── middlewares/
│   └── error.middleware.ts
└── utils/
    └── logger.ts              # Winston logger
```

## License

ISC
