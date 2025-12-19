# FoodFlow – Distributed Food Delivery System

**SWENG5111 Distributed Systems Mini Project**  
Addis Ababa Science & Technology University (AASTU) – 2025  
Team: Group 2 | Instructor: Felix Edesa, MSc

### Problem

Build a scalable, event-driven food delivery platform where customers order from local restaurants, delivery workers get assigned automatically, and all parties receive real-time updates — without manual coordination.

### Architecture

**8 Microservices** communicating via REST + RabbitMQ (Pub/Sub):

- User Service
- Restaurant (Product) Service
- Cart Service
- Order Service
- Payment Service
- Delivery Service
- Notification Service
- Analytics Service

**Tech Stack**

- Node.js + Express
- MySQL (per service)
- Redis (cache)
- RabbitMQ (event bus)
- Docker + Kubernetes
- Nginx (ingress)
- OpenAPI + JSON Schema contracts

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL database server
- RabbitMQ server (for order-service)
- Docker (optional, for containerized deployment)
- npm or yarn

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd food-delivery-management-system-microservices-
   ```

2. **Install dependencies for each service**
   ```bash
   cd services/user-service && npm install
   cd ../product-service && npm install
   cd ../order-service && npm install
   # Repeat for other services
   ```

3. **Set up databases**
   - Create MySQL databases for each service
   - Configure `DATABASE_URL` in each service's `.env` file

4. **Run Prisma migrations**
   ```bash
   # In each service directory with Prisma
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start RabbitMQ** (for event-driven communication)
   ```bash
   # Follow RabbitMQ setup instructions for your environment
   # RabbitMQ is used for pub/sub communication between services
   ```

6. **Start services**
   ```bash
   # Terminal 1: User Service (Port 3000)
   cd services/user-service && npm run dev
   
   # Terminal 2: Product Service (Port 4300)
   cd services/product-service && npm run dev
   
   # Terminal 3: Order Service (Port 3004)
   cd services/order-service && npm run dev
   
   # Continue for other services...
   ```

## 📚 Services Documentation

Each service has its own detailed README with API documentation, setup instructions, and configuration details:

- **[User Service](services/user-service/README.md)** - User authentication and management
  - Port: 3000
  - Endpoints: `/api/auth/*`, `/api/users/*`
  - Features: JWT authentication, user CRUD, password management

- **[Product Service](services/product-service/README.md)** - Menu items and categories management
  - Port: 4300
  - Endpoints: `/api/v1/menu-items/*`, `/api/v1/categories/*`
  - Features: Menu management, stock management, category management

- **[Order Service](services/order-service/README.md)** - Order processing and management
  - Port: 3004
  - Endpoints: `/api/v1/orders/*`
  - Features: Order creation, cancellation, status updates, RabbitMQ event publishing

- **Cart Service** - Shopping cart management (skeleton)
- **Payment Service** - Payment processing (skeleton)
- **Delivery Service** - Delivery management (skeleton)
- **Notification Service** - Notifications (skeleton)
- **Analytics Service** - Analytics and reporting (skeleton)

## 🔐 Authentication

All protected endpoints require JWT authentication. Tokens are issued by the **User Service** and validated by other services using a shared `JWT_SECRET`.

**Get a token:**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Use token:**
```bash
Authorization: Bearer <your-jwt-token>
```

## 🔄 Service Communication

### Synchronous (REST)
- Order Service → Product Service: Stock validation
- Order Service → User Service: JWT token verification
- All services communicate via HTTP REST APIs

### Asynchronous (Event-Driven)
- **RabbitMQ** is used for event-driven communication (as specified in Architecture)
- Order Service publishes events: `order.created`, `order.cancellation`, `order.status.updated`
- Other services can subscribe to these events for:
  - Payment processing
  - Notification delivery
  - Delivery scheduling
  - Analytics tracking

## 🗄️ Database Schema

Each service maintains its own database:

- **User Service**: Users, authentication data
- **Product Service**: Categories, MenuItems
- **Order Service**: Orders, OrderItems

All services use **Prisma ORM** with **MySQL** as the database.

## 🐳 Docker Deployment

Each service includes a `Dockerfile` for containerized deployment:

```bash
# Build and run individual service
cd services/user-service
docker build -t user-service:latest .
docker run -p 3000:3000 user-service:latest
```

See individual service READMEs for detailed Docker setup and environment variables.

## 📖 API Documentation

Each service provides interactive API documentation via Swagger UI:

- User Service: http://localhost:3000/docs
- Product Service: http://localhost:4300/docs
- Order Service: http://localhost:3004/docs

## 🛠️ Development

### Project Structure

```
.
├── services/
│   ├── user-service/       # User authentication & management
│   ├── product-service/    # Menu & category management
│   ├── order-service/      # Order processing
│   ├── cart-service/       # Shopping cart (skeleton)
│   ├── payment-service/    # Payment processing (skeleton)
│   ├── delivery-service/   # Delivery management (skeleton)
│   ├── notification-service/ # Notifications (skeleton)
│   └── analytics-service/  # Analytics (skeleton)
├── docs/                   # Documentation & diagrams
└── README.md              # This file
```

### Environment Variables

Each service requires its own `.env` file. See individual service READMEs for required environment variables.

**Common variables:**
- `PORT` - Service port number
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Shared secret for JWT token verification

## 🧪 Testing

Run tests for each service (when implemented):

```bash
cd services/user-service
npm test
```

## 📝 License

ISC
