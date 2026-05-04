#!/bin/bash

# FoodFlow Microservices - K8s Deployment Script
# This script builds Docker images and applies K8s manifests.

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}   ☸️  FoodFlow Kubernetes Deployer          ${NC}"
echo -e "${BLUE}===============================================${NC}"

# 1. Create Namespace
echo -e "\n${YELLOW}Step 1: Setting up Namespaces...${NC}"
kubectl apply -f infrastructure/k8s/namespaces/dev-namespace.yaml

# 2. Apply Common Config
echo -e "\n${YELLOW}Step 2: Applying ConfigMaps and Secrets...${NC}"
kubectl apply -f infrastructure/k8s/common/configmap.yaml
kubectl apply -f infrastructure/k8s/user-service/user-db-secret.yaml
kubectl apply -f infrastructure/k8s/product-service/product-db-secret.yaml
kubectl apply -f infrastructure/k8s/order-service/order-db-secret.yaml

# 3. Start Infrastructure (RabbitMQ & Databases)
echo -e "\n${YELLOW}Step 3: Deploying Infrastructure...${NC}"
kubectl apply -f infrastructure/k8s/rabbitmq/
kubectl apply -f infrastructure/k8s/user-service/mysql-deployment.yaml
kubectl apply -f infrastructure/k8s/user-service/mysql-service.yaml
kubectl apply -f infrastructure/k8s/product-service/mysql-deployment.yaml
kubectl apply -f infrastructure/k8s/product-service/mysql-service.yaml
kubectl apply -f infrastructure/k8s/order-service/mysql-deployment.yaml
kubectl apply -f infrastructure/k8s/order-service/mysql-service.yaml

# 4. Build and Deploy Services
SERVICES=("user-service" "product-service" "order-service" "api-gateway")

echo -e "\n${YELLOW}Step 4: Building and Deploying Services...${NC}"

for service in "${SERVICES[@]}"; do
    echo -e "${BLUE}Processing ${service}...${NC}"
    
    # Check if Dockerfile exists
    if [ -f "services/${service}/Dockerfile" ]; then
        echo -e "  Building Docker image: ${service}:latest..."
        # If using minikube: eval $(minikube docker-env)
        docker build -t "${service}:latest" "services/${service}" > /dev/null 2>&1
    fi
    
    # Apply manifests
    if [ -d "infrastructure/k8s/${service}" ]; then
        kubectl apply -f "infrastructure/k8s/${service}/"
    fi
done

echo -e "\n${GREEN}All services have been applied to the Kubernetes cluster!${NC}"
echo -e "Check status with: ${YELLOW}kubectl get pods -n dev${NC}"
echo -e "Access API Gateway at: ${YELLOW}http://localhost:30080${NC} (if using NodePort on localhost)"
