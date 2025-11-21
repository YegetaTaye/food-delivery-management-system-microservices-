# FoodFlow – Distributed Food Delivery System

**SWENG5111 Distributed Systems Mini Project**  
Addis Ababa Science & Technology University (AASTU) – 2025  
Team: Group 2 | Instructor: Felix Edesa, MSc

### Problem

Build a scalable, event-driven food delivery platform where customers order from local restaurants, delivery workers get assigned automatically, and all parties receive real-time updates — without manual coordination.

### Architecture

**8 Microservices** communicating via REST + Apache Kafka (Pub/Sub):

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
- Kafka (event bus)
- Docker + Kubernetes
- Nginx (ingress)
- OpenAPI + JSON Schema contracts
