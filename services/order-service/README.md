# Order Service

Order management microservice for the food delivery platform. Handles order creation, cancellation, status updates, and integrates with product-service and user-service. Uses RabbitMQ for event-driven communication.

## ✨ Features

- **Order Management** - Create, read, cancel orders
- **Order Status Management** - Update order status (PENDING, CONFIRMED, CANCELLED)
- **Stock Integration** - Validates and reserves stock with product-service
- **Event-Driven Architecture** - Publishes order events to RabbitMQ
- **JWT Authentication** - Protected endpoints using JWT tokens from user-service
- **MySQL Database** - Prisma ORM with MySQL
- **Service Integration** - HTTP communication with product-service and user-service
- **Input Validation** - Joi schema validation
- **API Versioning** - RESTful API with version support (v1)
- **API Documentation** - Swagger/OpenAPI documentation
- **TypeScript** - Type-safe codebase
- **Winston Logger** - Structured logging
- **Health Check** - Built-in health endpoint

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL database
- RabbitMQ server
- Product Service running
- User Service running
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3004
SERVICE_NAME=order-service
NODE_ENV=development
API_VERSION=v1

# Database
DATABASE_URL="mysql://user:password@localhost:3306/order_service_db"

# JWT Configuration (must match user-service JWT_SECRET)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Service URLs
PRODUCT_SERVICE_URL=http://localhost:4300/api/v1
USER_SERVICE_URL=http://localhost:3000/api
```

### 4. Start RabbitMQ

Make sure RabbitMQ is running:

```bash
# Using Docker
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### 5. Run in Development

```bash
npm run dev
```

The service will start on `http://localhost:3004`

### 6. Access Documentation

- **API Docs**: http://localhost:3004/docs
- **Health Check**: http://localhost:3004/health

## 📝 Available Scripts

| Script              | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start development server with hot reload |
| `npm run build`     | Build TypeScript to JavaScript           |
| `npm start`         | Start production server                  |

## 📚 API Endpoints

All endpoints are prefixed with `/api/v1` (configurable via `API_VERSION`).

### Orders

- `POST /api/v1/orders` - Create a new order (🔒 requires auth)
  - Request body: `{ items: [{ productId: string, productName: string, quantity: number, price: number }] }`
  - Validates stock availability with product-service
  - Publishes `order.created` event to RabbitMQ
- `GET /api/v1/orders` - Get all orders for authenticated user (🔒 requires auth)
- `GET /api/v1/orders/:id` - Get order by ID (🔒 requires auth)
- `PATCH /api/v1/orders/:id/cancel` - Cancel an order (🔒 requires auth)
  - Publishes `order.cancellation` event to RabbitMQ
- `PATCH /api/v1/orders/:id/status` - Update order status (Admin/Internal use)
  - Request body: `{ status: "PENDING" | "CONFIRMED" | "CANCELLED" }`
  - Publishes `order.status.updated` event to RabbitMQ

### Health

- `GET /health` - Health check (public)

## 🔐 Authentication

All order endpoints require JWT authentication. Include the token in the `Authorization` header:

```bash
Authorization: Bearer <your-jwt-token>
```

The JWT token should be obtained from the user-service authentication endpoints.

## 📁 Project Structure

```
.
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment configuration
│   │   └── swagger.ts          # Swagger setup
│   ├── controllers/
│   │   ├── health.controller.ts
│   │   └── order.controller.ts # Order logic
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # JWT authentication middleware
│   │   ├── error.middleware.ts # Global error handler
│   │   └── validate.middleware.ts # Request validation
│   ├── routes/
│   │   ├── health.route.ts
│   │   └── order.routes.ts     # Order routes
│   ├── services/
│   │   ├── order.service.ts    # Order business logic
│   │   └── rabbitmq.service.ts # RabbitMQ integration
│   ├── types/
│   │   └── AppError.ts         # Error types
│   ├── utils/
│   │   └── logger.ts           # Winston logger
│   ├── validations/
│   │   └── order.validation.ts # Joi validation schemas
│   ├── app.ts                  # Express app setup
│   └── index.ts                # Server entry point
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── docs/
│   └── swagger.json            # Auto-generated API docs
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🗄️ Database Schema

### Order Model

```prisma
model Order {
  id          String      @id @default(uuid())
  userId      String
  status      OrderStatus @default(PENDING)
  totalAmount Decimal     @db.Decimal(10, 2)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]
}

model OrderItem {
  id          String  @id @default(uuid())
  orderId     String
  productId   String
  productName String
  quantity    Int
  price       Decimal @db.Decimal(10, 2)
  order       Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

enum OrderStatus {
  PENDING
  CONFIRMED
  CANCELLED
}
```

## 🐰 RabbitMQ Integration

### Exchange Configuration

- **Exchange Name**: `orders.events`
- **Exchange Type**: `topic`
- **Durable**: `true`

### Events Published

1. **order.created**
   - Published when a new order is created
   - Payload: `{ orderId, userId, totalAmount, items }`

2. **order.cancellation**
   - Published when an order is cancelled
   - Payload: `{ orderId, userId, items }`

3. **order.status.updated**
   - Published when order status is updated
   - Payload: `{ orderId, userId, status }`

### Usage

Other services can subscribe to these events to handle:
- Payment processing
- Notification sending
- Delivery scheduling
- Analytics tracking

## 🤝 Service Integration

### Product Service Integration

The order service communicates with product-service via HTTP:

- **Stock Validation**: Validates stock availability before creating orders (synchronous check)

**Endpoints Used:**
- `GET {PRODUCT_SERVICE_URL}/menu-items/:id` - Validates stock availability and product status

Note: Stock reservation and release operations are typically handled asynchronously by other services consuming the RabbitMQ events (`order.created`, `order.cancellation`). The product-service provides stock management endpoints that can be called by those consumers.

### User Service Integration

The order service verifies JWT tokens issued by user-service. Both services must share the same `JWT_SECRET`.

## 🐳 Docker

### Build Image

```bash
docker build -t order-service:latest .
```

### Run Container

```bash
docker run -p 3004:3004 \
  -e PORT=3004 \
  -e SERVICE_NAME=order-service \
  -e NODE_ENV=production \
  -e API_VERSION=v1 \
  -e DATABASE_URL="mysql://user:password@host:3306/db" \
  -e JWT_SECRET="your-secret-key" \
  -e JWT_EXPIRES_IN=7d \
  -e JWT_REFRESH_EXPIRES_IN=30d \
  -e RABBITMQ_URL="amqp://rabbitmq:5672" \
  -e PRODUCT_SERVICE_URL="http://product-service:4300/api/v1" \
  -e USER_SERVICE_URL="http://user-service:3000/api" \
  order-service:latest
```

### Docker Compose Example

```yaml
version: "3.8"
services:
  order-service:
    build: .
    ports:
      - "3004:3004"
    environment:
      - PORT=3004
      - SERVICE_NAME=order-service
      - NODE_ENV=production
      - API_VERSION=v1
      - DATABASE_URL=mysql://user:password@mysql:3306/order_service_db
      - JWT_SECRET=your-super-secret-jwt-key
      - JWT_EXPIRES_IN=7d
      - JWT_REFRESH_EXPIRES_IN=30d
      - RABBITMQ_URL=amqp://rabbitmq:5672
      - PRODUCT_SERVICE_URL=http://product-service:4300/api/v1
      - USER_SERVICE_URL=http://user-service:3000/api
    depends_on:
      - mysql
      - rabbitmq
      - product-service
      - user-service
```

## 📦 Dependencies

### Production:

- `express` - Web framework
- `@prisma/client` - Prisma ORM client
- `jsonwebtoken` - JWT token verification
- `joi` - Input validation
- `amqplib` - RabbitMQ client
- `axios` - HTTP client for service communication
- `uuid` - UUID generation
- `dotenv` - Environment variables
- `winston` - Logging
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `swagger-ui-express` - API documentation UI
- `swagger-jsdoc` - Swagger spec generation

### Development:

- `typescript` - TypeScript compiler
- `ts-node-dev` - Development server with hot reload
- `prisma` - Prisma CLI
- `@types/*` - Type definitions

## 🔄 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3004
SERVICE_NAME=order-service
API_VERSION=v1
DATABASE_URL=mysql://user:password@host:3306/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
RABBITMQ_URL=amqp://rabbitmq-host:5672
PRODUCT_SERVICE_URL=http://product-service:4300/api/v1
USER_SERVICE_URL=http://user-service:3000/api
```

### Build for Production

```bash
npm run build
npm start
```

## 🔒 Security Features

- **JWT Authentication**: Token-based authentication for all endpoints
- **Helmet**: HTTP security headers
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Joi schema validation
- **Error Handling**: Prevents information leakage in production

## 📊 Logging

Winston logger includes:

- Timestamp on all logs
- Service name in metadata
- Colored console output in development
- JSON format for production
- Request logging middleware

## 🔄 Order Flow

1. **Order Creation**:
   - Client sends order request with JWT token
   - Service validates JWT token
   - Service validates stock availability with product-service (synchronous HTTP call)
   - Service calculates total amount
   - Service creates order in database with PENDING status
   - Service publishes `order.created` event to RabbitMQ
   - Note: Stock reservation should be handled by other services consuming the RabbitMQ event

2. **Order Cancellation**:
   - Client sends cancel request with JWT token
   - Service validates order ownership
   - Service validates order is not already cancelled
   - Service updates order status to CANCELLED in database
   - Service publishes `order.cancellation` event to RabbitMQ
   - Note: Stock release should be handled by other services consuming the RabbitMQ event

## 🚨 Error Handling

The service handles various error scenarios:

- Insufficient stock
- Invalid product IDs
- Network errors when communicating with other services
- Database errors
- RabbitMQ connection errors

All errors are logged and appropriate HTTP status codes are returned.

## 📄 License

ISC
