# 🛡️ Group 3: DevSecOps – Strategic Microservices Project
## 📋 Assignment Title: DevSecOps (Assignment 2)
## 🚀 Project: Microservices-Based Application Architecture

> **Executive Summary**: This project demonstrates a production-grade, distributed e-commerce ecosystem designed with a "Security-First" (DevSecOps) mindset. By leveraging container orchestration and event-driven communication, the system achieves high availability, fault tolerance, and secure operational integrity.

---

## 🏗️ 1. Strategic System Architecture

The application is architected as a decentralized mesh of independent microservices, each owning its own data domain and communicating via a unified API Gateway.

### 🧩 1.1 Core Microservices Matrix

| Service | Technology | Domain Responsibility |
| :--- | :--- | :--- |
| **Auth (User)** | Node.js / Prisma | Identity Matrix, RBAC, JWT issuance, and Personnel access control. |
| **Product** | Node.js / MySQL | Arsenal Catalog, inventory management, and real-time stock telemetry. |
| **Order** | Node.js / Express | Strategic fulfillment core, order lifecycle management, and event orchestration. |
| **Payment** | Python / Node.js | Financial Vault, transaction verification, and secure payment processing. |
| **Notification**| Node.js / RabbitMQ| Communication Uplink, real-time alerts, and system status broadcasts. |

### 🌉 1.2 The API Gateway Layer
We utilize **NGINX Ingress** as the tactical entry point. It provides:
- **Load Balancing**: Distributing incoming requests across multiple service pods.
- **SSL/TLS Termination**: Ensuring all external communication is encrypted.
- **Path-Based Routing**: Directing traffic (e.g., `/api/v1/users` -> `user-service`).

---

## 🛡️ 2. DevSecOps & Security Integration

Security is not an afterthought but integrated into every layer of the infrastructure.

### 🔑 2.1 Identity & Access Management (IAM)
- **Stateless Authentication**: Implementation of **JWT (JSON Web Tokens)** ensures that service-to-service calls are authenticated without central session storage.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions (e.g., `ADMIN` vs `USER`) govern access to sensitive administrative hubs.
- **Credential Protection**: Using **Bcrypt** for one-way password hashing before persistence to the Identity Matrix (MySQL).

### ⚙️ 2.2 Infrastructure Security (IaC)
- **Kubernetes Namespaces**: Logical isolation of development and production environments.
- **Resource Limits**: Defining CPU and Memory quotas to prevent "Noisy Neighbor" effects and resource exhaustion attacks.
- **ConfigMaps & Secrets**: Separation of application logic from sensitive configuration (API Keys, DB Credentials).

### 2.3 Automated CI/CD & DevSecOps Pipeline
Integrated via **GitHub Actions**, our pipeline automates the "Sec" in DevSecOps:
- **Build Validation**: Automated type-checking using TypeScript's `tsc --noEmit`.
- **Vulnerability Scanning**:
    - **Trivy Integration**: Scans the filesystem for known vulnerabilities in OS packages and language-specific dependencies.
    - **Dependency Auditing**: Automated `npm audit` checks for moderate or higher severity vulnerabilities in the supply chain.
- **Image Integrity**: Building Docker images only if all security and quality gates are passed.
- **Automated Rollouts**: Ensuring zero-downtime deployments via Kubernetes `RollingUpdate` strategies.

---

## 📡 3. Event-Driven Communication (The Event Bus)

To maintain loose coupling, services interact via **RabbitMQ** using a Pub/Sub topology.

### 🌪️ Transactional Event Flow (Order Lifecycle)
1. **Order Initiation**: `Order Service` creates a record and publishes `order.created`.
2. **Financial Clearance**: `Payment Service` consumes `order.created`, processes the transaction, and publishes `payment.completed`.
3. **Inventory Reservation**: `Product Service` adjusts stock levels based on the completed payment.
4. **Communication Uplink**: `Notification Service` captures all events to alert the user of status changes.

---

## 📊 4. Data Intelligence & Persistence

Each service maintains its own "Single Source of Truth":
- **User Service**: MySQL 8.0 (Identity Matrix).
- **Product Service**: MySQL 8.0 (Arsenal Catalog with Category/MenuItem relations).
- **Cart Service**: Redis (High-speed temporary resource cache).

---

## 📈 5. Scalability & System Resilience

The project is designed to handle high-velocity traffic through several horizontal scaling strategies:

- **Horizontal Pod Autoscaling (HPA)**: Kubernetes can automatically scale the number of service pods based on CPU/Memory utilization metrics.
- **Stateless Design**: By storing state in Redis and MySQL, individual service instances can be terminated or spawned without losing transactional data.
- **Fault Tolerance**: RabbitMQ ensures that if a service (e.g., Notification) is temporarily offline, events are queued and processed once the service uplinks back to the grid.

---

## 🧪 6. System Verification Plan

To ensure the integrity of the Command Sanctuary, the following validation steps are implemented:

1. **Automated Unit Testing**: Each service contains a test suite (using Jest) to validate core business logic.
2. **API Contract Validation**: Swagger UI endpoints are used to verify that REST APIs adhere to the defined OpenAPI specifications.
3. **Log Telemetry**: Real-time log inspection via `kubectl logs` ensures that inter-service event flows are executing without errors.

---

## 🚀 7. Operational Deployment Guide

### 🛠️ 7.1 Prerequisites
- **Docker Engine** (v20+)
- **kubectl** & **k3d**
- **Node.js 18+**

### 🏁 7.2 Tactical Deployment Sequence
```bash
# 1. Initialize the k3d Cluster Cluster
k3d cluster create dev --port "8080:80@loadbalancer" --agents 1

# 2. Deploy Infrastructure (MySQL, RabbitMQ, Redis)
docker-compose -f docker-compose.infra.yml up -d

# 3. Uplink Microservices to Kubernetes
./scripts/deploy.sh
```

---

## 👥 8. Strategic Personnel (Group 3)
- **Member 1**: Lead Architect / Security Integration
- **Member 2**: Backend Orchestration / API Design
- **Member 3**: Frontend Intelligence / UI/UX
- **Member 4**: DevOps / Infrastructure Management

**Instructor**: Felix Edesa, MSc  
**Institution**: Addis Ababa Science & Technology University (AASTU)
**Academic Year**: 2025

---
<p align="center">
  🛡️ <i>This project represents a commitment to high-velocity, secure software delivery through modern microservices orchestration.</i> 🛡️
</p>
