# Analytics Service

An event-driven analytics service that collects system events and stores them for analytics and reporting.

## Overview

The Analytics Service is responsible for:

- Listening to domain events from RabbitMQ
- Persisting events to MySQL for analytics
- Providing APIs to query and analyze events

## Architecture

```
┌─────────────────┐     order.created      ┌───────────────────────┐
│  Order Service  │ ─────────────────────► │                       │
└─────────────────┘   order.cancelled      │                       │
                     order.status.updated  │   Analytics Service   │
┌─────────────────┐                        │                       │
│ Payment Service │   payment.completed    │   ┌───────────────┐   │
└─────────────────┘ ─────────────────────► │   │    MySQL      │   │
                                           │   │   (Prisma)    │   │
                                           │   └───────────────┘   │
                                           └───────────────────────┘
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript (strict mode)
- **Database**: MySQL with Prisma ORM
- **Message Broker**: RabbitMQ
- **API Documentation**: Swagger (OpenAPI 3.0)
- **Logging**: Winston

## Events Consumed

| Event                | Routing Key            | Description          |
| -------------------- | ---------------------- | -------------------- |
| Order Created        | `order.created`        | New order placed     |
| Order Cancelled      | `order.cancelled`      | Order cancelled      |
| Order Status Updated | `order.status.updated` | Order status changed |
| Payment Completed    | `payment.completed`    | Payment processed    |

**Exchange**: `order.events` (direct)

## Database Schema

```prisma
model AnalyticsEvent {
  id            String   @id @default(uuid())
  eventType     String
  sourceService String
  payload       Json
  createdAt     DateTime @default(now())
}
```

## API Endpoints

| Method | Endpoint                  | Description                       |
| ------ | ------------------------- | --------------------------------- |
| GET    | `/health`                 | Health check                      |
| GET    | `/analytics/events`       | List all events (with pagination) |
| GET    | `/analytics/events/:type` | Get events by type                |
| GET    | `/analytics/stats`        | Get event statistics              |
| GET    | `/docs`                   | Swagger API documentation         |

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

# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

### Environment Variables

| Variable       | Description             | Default                 |
| -------------- | ----------------------- | ----------------------- |
| `PORT`         | Server port             | `4700`                  |
| `NODE_ENV`     | Environment             | `development`           |
| `SERVICE_NAME` | Service identifier      | `analytics-service`     |
| `DATABASE_URL` | MySQL connection URL    | -                       |
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://localhost:5672` |

### Database URL Format

```
mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

Example:

```
DATABASE_URL="mysql://root:password@localhost:3306/analytics_db"
```

### Running the Service

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Production mode
npm start

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Docker

```bash
# Build image
docker build -t analytics-service .

# Run container
docker run -d \
  -p 4700:4700 \
  -e DATABASE_URL=mysql://root:password@host.docker.internal:3306/analytics_db \
  -e RABBITMQ_URL=amqp://host.docker.internal:5672 \
  analytics-service
```

## API Examples

### Get All Events

```bash
curl "http://localhost:4700/analytics/events?limit=50&offset=0"
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "eventType": "order.created",
      "sourceService": "order-service",
      "payload": {
        "orderId": "order-123",
        "userId": "user-456",
        "total": 29.99
      },
      "createdAt": "2025-12-27T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Events by Type

```bash
curl "http://localhost:4700/analytics/events/order.created"
```

Response:

```json
{
  "success": true,
  "data": [...],
  "count": 50,
  "eventType": "order.created"
}
```

### Get Statistics

```bash
curl http://localhost:4700/analytics/stats
```

Response:

```json
{
  "success": true,
  "data": {
    "totalEvents": 500,
    "byEventType": {
      "order.created": 150,
      "order.cancelled": 20,
      "order.status.updated": 280,
      "payment.completed": 50
    },
    "bySourceService": {
      "order-service": 450,
      "payment-service": 50
    }
  }
}
```

## Project Structure

```
├── prisma/
│   └── schema.prisma         # Database schema
├── src/
│   ├── index.ts              # Application entry point
│   ├── app.ts                # Express app configuration
│   ├── config/
│   │   ├── env.ts           # Environment configuration
│   │   ├── database.ts      # Prisma connection
│   │   ├── rabbitmq.ts      # RabbitMQ connection
│   │   └── swagger.ts       # Swagger configuration
│   ├── routes/
│   │   ├── health.route.ts  # Health check route
│   │   └── analytics.routes.ts # Analytics API routes
│   ├── controllers/
│   │   ├── health.controller.ts
│   │   └── analytics.controller.ts
│   ├── services/
│   │   └── analytics.service.ts # Business logic
│   ├── messaging/
│   │   └── rabbitmq.consumer.ts # Event consumer
│   ├── types/
│   │   └── analytics.types.ts # TypeScript interfaces
│   ├── middlewares/
│   │   └── error.middleware.ts
│   └── utils/
│       └── logger.ts        # Winston logger
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Database Migrations

```bash
# Create a new migration
npm run prisma:migrate

# Apply migrations in production
npm run prisma:migrate:prod

# Reset database (development only)
npx prisma migrate reset
```

## License

ISC
