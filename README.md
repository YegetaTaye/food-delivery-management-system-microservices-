# 🍔 FoodFlow – Distributed Food Delivery System

<p align="center">
  <strong>A production-ready microservices architecture for food delivery</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Python-3.11-yellow?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Kubernetes-Ready-326CE5?logo=kubernetes" alt="Kubernetes">
  <img src="https://img.shields.io/badge/RabbitMQ-Event--Driven-FF6600?logo=rabbitmq" alt="RabbitMQ">
</p>

---

**SWENG5111 Distributed Systems Mini Project**
Addis Ababa Science & Technology University (AASTU) – 2025
Team: Group 2 | Instructor: Felix Edesa, MSc

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Event-Driven Communication](#-event-driven-communication)
- [Monitoring & Debugging](#-monitoring--debugging)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Contributing](#-contributing)

---

## 🎯 Overview

**FoodFlow** is a scalable, event-driven food delivery platform built with microservices architecture. It demonstrates how modern distributed systems handle:

- **Order Management** – Create, track, and cancel orders
- **Payment Processing** – Secure payment handling with multiple methods
- **Delivery Assignment** – Automatic driver assignment and real-time tracking
- **Real-time Notifications** – Push notifications for all parties
- **Analytics** – Event sourcing for business intelligence

### Key Features

✅ **8 Microservices** – Each with single responsibility
✅ **Event-Driven** – RabbitMQ pub/sub for loose coupling
✅ **API Gateway** – NGINX Ingress for routing & rate limiting
✅ **Container-Ready** – Docker + Kubernetes deployment
✅ **OpenAPI Specs** – Full API documentation with Swagger
✅ **Message Tracing** – Debug event flow through RabbitMQ UI

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           API Gateway (NGINX)                           │
│                         http://localhost:8080                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  User Service │         │Product Service│         │  Cart Service │
│    :3000      │         │    :3002      │         │    :3001      │
│   (MySQL)     │         │   (MySQL)     │         │   (Redis)     │
└───────────────┘         └───────────────┘         └───────────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │         RabbitMQ              │
                    │    (Event Bus/Message Queue)  │
                    │     orders.events exchange    │
                    └───────────────┬───────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ Order Service │         │Payment Service│         │Delivery Service│
│    :3003      │◄────────│    :3004      │────────►│    :3005      │
│   (MySQL)     │         │   (MySQL)     │         │   (MySQL)     │
└───────────────┘         └───────────────┘         └───────────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
          ┌───────────────┐               ┌───────────────┐
          │ Notification  │               │   Analytics   │
          │   Service     │               │   Service     │
          │    :3006      │               │    :3007      │
          │  (In-Memory)  │               │  (In-Memory)  │
          └───────────────┘               └───────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js 18+, Express, TypeScript |
| **Alternative Backend** | Python 3.11, FastAPI |
| **Database** | MySQL 8.0 (per service), Redis (caching) |
| **Message Queue** | RabbitMQ 3.13 |
| **ORM** | Prisma (Node.js), SQLAlchemy (Python) |
| **API Gateway** | NGINX Ingress Controller |
| **Container** | Docker, Kubernetes (k3d) |
| **Documentation** | OpenAPI 3.0, Swagger UI |

---

## 🚀 Quick Start

### Prerequisites

- **Docker** 20.10+ with Docker Compose
- **kubectl** 1.28+
- **k3d** 5.0+ (lightweight Kubernetes)

```bash
# Install k3d (if not installed)
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
```

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/your-username/foodflow.git
cd foodflow

# Run the setup script (creates cluster, builds images, deploys everything)
./scripts/setup.sh
```

This will:
1. ✅ Check prerequisites
2. ✅ Create a k3d Kubernetes cluster
3. ✅ Deploy NGINX Ingress Controller
4. ✅ Build all 9 microservice Docker images
5. ✅ Deploy services to Kubernetes
6. ✅ Setup RabbitMQ message tracing

**Access the system:**
- 🌐 **API Gateway:** http://localhost:8080
- 🐰 **RabbitMQ UI:** http://localhost:8080/rabbitmq (admin/admin123)

---

## 📦 Installation

### Option 1: Kubernetes (Recommended)

```bash
# Step 1: Create k3d cluster
k3d cluster create dev --port "8080:80@loadbalancer" --agents 1

# Step 2: Deploy NGINX Ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# Step 3: Build Docker images
./scripts/build-all.sh

# Step 4: Deploy to Kubernetes
./scripts/deploy.sh
```

### Option 2: Local Development (Without Kubernetes)

```bash
# Prerequisites: Node.js 18+, MySQL, RabbitMQ running locally

# Install dependencies for each service
cd services/user-service && npm install
cd ../product-service && npm install
cd ../order-service && npm install
# ... repeat for other services

# Setup databases (in each service directory)
npm run prisma:generate
npm run prisma:migrate

# Start services (in separate terminals)
cd services/user-service && npm run dev
cd services/product-service && npm run dev
cd services/order-service && npm run dev
# ... repeat for other services
```

### Environment Variables

Each service requires environment configuration. Copy the example and modify:

```bash
cp services/user-service/.env.example services/user-service/.env
```

**Common Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Service port | `3000` |
| `DATABASE_URL` | MySQL connection | `mysql://user:pass@localhost:3306/db` |
| `RABBITMQ_URL` | RabbitMQ connection | `amqp://admin:admin123@localhost:5672` |
| `JWT_SECRET` | JWT signing key | `your-secret-key` |
| `NODE_ENV` | Environment | `development` |

---

## 📚 API Documentation

### API Endpoints

| Service | Endpoint | Port | Description |
|---------|----------|------|-------------|
| **User** | `/api/v1/users` | 3000 | Authentication & user management |
| **Product** | `/api/v1/products` | 3002 | Menu items & categories |
| **Cart** | `/api/v1/cart` | 3001 | Shopping cart (Redis-backed) |
| **Order** | `/api/v1/orders` | 3003 | Order processing |
| **Payment** | `/api/v1/payments` | 3004 | Payment processing |
| **Delivery** | `/api/v1/deliveries` | 3005 | Delivery management |
| **Notification** | `/api/v1/notifications` | 3006 | In-memory notifications |
| **Analytics** | `/api/v1/analytics` | 3007 | Event analytics |

### Swagger Documentation

Each service provides interactive API docs:

```
http://localhost:8080/api/v1/users/api-docs
http://localhost:8080/api/v1/products/api-docs
http://localhost:8080/api/v1/orders/api-docs
```

### Quick API Examples

```bash
# Health check
curl http://localhost:8080/api/v1/users/health

# Register a user
curl -X POST http://localhost:8080/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login (get JWT token)
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create order (with auth token)
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "items": [{"productId": "123", "quantity": 2}],
    "deliveryAddress": {"street": "123 Main St", "city": "Addis Ababa"}
  }'

# Get notifications
curl http://localhost:8080/api/v1/notifications

# Get analytics
curl http://localhost:8080/api/v1/analytics/events
curl http://localhost:8080/api/v1/analytics/stats
```

---

## 📨 Event-Driven Communication

### Event Flow

```
┌─────────────┐     order.created      ┌─────────────┐
│   Order     │ ──────────────────────►│   Payment   │
│   Service   │                        │   Service   │
└─────────────┘                        └──────┬──────┘
                                              │
                               payment.completed
                                              │
┌─────────────┐     order.status.updated      │
│  Delivery   │ ◄─────────────────────────────┘
│   Service   │
└──────┬──────┘
       │
       │  delivery.status.updated
       ▼
┌─────────────┐                        ┌─────────────┐
│Notification │                        │  Analytics  │
│   Service   │                        │   Service   │
└─────────────┘                        └─────────────┘
       ▲                                      ▲
       │          (all events)                │
       └──────────────────────────────────────┘
```

### Event Types

| Event | Routing Key | Publisher | Consumers |
|-------|-------------|-----------|-----------|
| Order Created | `order.created` | Order Service | Payment, Notification, Analytics |
| Order Cancelled | `order.cancelled` | Order Service | Payment, Delivery, Analytics |
| Order Status Updated | `order.status.updated` | Order Service | Notification, Analytics |
| Payment Completed | `payment.completed` | Payment Service | Order, Delivery, Notification |
| Payment Failed | `payment.failed` | Payment Service | Order, Notification |
| Delivery Assigned | `delivery.assigned` | Delivery Service | Notification, Analytics |
| Delivery Status Updated | `delivery.status.updated` | Delivery Service | Order, Notification |

### Event Schema Examples

See `/events/` directory for JSON schemas:

```json
// order.created event
{
  "eventId": "uuid",
  "eventType": "order.created",
  "timestamp": "2026-01-24T12:00:00Z",
  "orderId": "order-123",
  "userId": "user-456",
  "totalAmount": "150.00",
  "items": [...]
}
```

---

## 🔍 Monitoring & Debugging

### RabbitMQ Message Tracing

All events are captured in a `message-trace` queue for debugging:

1. Open **RabbitMQ UI**: http://localhost:8080/rabbitmq
2. Login: `admin` / `admin123`
3. Go to **Queues and Streams** → **message-trace**
4. Click **Get messages** to view event history

```bash
# View messages via CLI
kubectl exec deployment/rabbitmq -n dev -- rabbitmqadmin -u admin -p admin123 \
  get queue=message-trace count=10 ackmode=ack_requeue_true
```

### View Service Logs

```bash
# Using the logs script
./scripts/logs.sh order-service
./scripts/logs.sh payment-service

# Or directly with kubectl
kubectl logs -f deployment/order-service -n dev
kubectl logs -f deployment/rabbitmq -n dev
```

### Check System Status

```bash
# All pods
kubectl get pods -n dev

# All services
kubectl get svc -n dev

# Describe a specific pod
kubectl describe pod <pod-name> -n dev
```

---

## 📁 Project Structure

```
foodflow/
├── 📂 services/                    # Microservices
│   ├── 📂 user-service/           # User authentication (Node.js)
│   ├── 📂 product-service/        # Product catalog (Node.js)
│   ├── 📂 cart-service/           # Shopping cart (Node.js + Redis)
│   ├── 📂 order-service/          # Order management (Node.js)
│   ├── 📂 payment-service/        # Payment processing (Node.js)
│   ├── 📂 payment-service-python/ # Payment processing (Python/FastAPI)
│   ├── 📂 delivery-service/       # Delivery management (Node.js)
│   ├── 📂 notification-service/   # Notifications (Node.js, in-memory)
│   └── 📂 analytics-service/      # Analytics (Node.js, in-memory)
│
├── 📂 infrastructure/
│   └── 📂 k8s/                    # Kubernetes manifests
│       ├── 📂 namespaces/         # Namespace definitions
│       ├── 📂 common/             # Shared ConfigMaps, Secrets
│       ├── 📂 gateway/            # Ingress configuration
│       ├── 📂 rabbitmq/           # RabbitMQ deployment
│       └── 📂 <service>/          # Per-service deployments
│
├── 📂 events/                     # Event JSON schemas
│   ├── 📂 order/
│   ├── 📂 payment/
│   └── 📂 delivery/
│
├── 📂 openapi/                    # OpenAPI specifications
│   ├── user-service.yaml
│   ├── order-service.yaml
│   └── ...
│
├── 📂 docs/                       # Documentation & diagrams
│   ├── database_schema.sql
│   └── 📂 diagrams/               # PlantUML diagrams
│
├── 📂 scripts/                    # Automation scripts
│   ├── setup.sh                   # Full environment setup
│   ├── build-all.sh               # Build all Docker images
│   ├── deploy.sh                  # Deploy to Kubernetes
│   ├── cleanup.sh                 # Remove cluster & cleanup
│   └── logs.sh                    # View service logs
│
└── 📄 README.md                   # This file
```

---

## 💻 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `./scripts/setup.sh` | Complete environment setup (first time) |
| `./scripts/build-all.sh` | Build all Docker images |
| `./scripts/deploy.sh` | Deploy/update Kubernetes resources |
| `./scripts/cleanup.sh` | Delete cluster and clean up |
| `./scripts/logs.sh <service>` | Tail logs for a service |

### Building Individual Services

```bash
# Build one service
cd services/order-service
docker build -t yegeta100/order-service:latest .

# Import to k3d
k3d image import yegeta100/order-service:latest --cluster dev

# Restart deployment
kubectl rollout restart deployment/order-service -n dev
```

### Running Tests

```bash
cd services/order-service
npm test
```

### Database Migrations

```bash
cd services/order-service
npm run prisma:migrate      # Apply migrations
npm run prisma:generate     # Generate Prisma client
npm run prisma:studio       # Open Prisma Studio GUI
```

---

## 🧹 Cleanup

```bash
# Remove everything
./scripts/cleanup.sh

# Or manually
k3d cluster delete dev
docker images | grep yegeta100 | awk '{print $3}' | xargs docker rmi -f
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

ISC License - see [LICENSE](LICENSE) for details.

---

## 👥 Team

**Group 2 – AASTU SWENG5111**

- Team Member 1
- Team Member 2
- Team Member 3
- Team Member 4

**Instructor:** Felix Edesa, MSc

---

<p align="center">
  Made with ❤️ at Addis Ababa Science & Technology University
</p>
