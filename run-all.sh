#!/bin/bash

# FoodFlow Microservices - Run All Script
# This script starts the infrastructure and all microservices for development.

# Colors for logging
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}   🍔 FoodFlow Microservices System Starter   ${NC}"
echo -e "${BLUE}===============================================${NC}"

# Global Authentication Secret for all services
export JWT_SECRET="foodflow-secret-key-2024-dev"

# 1. Start Infrastructure via Docker Compose
echo -e "\n${YELLOW}Step 1: Starting Infrastructure (RabbitMQ, MySQL, Redis)...${NC}"
docker-compose -f docker-compose.infra.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start Docker infrastructure. Please ensure Docker is running.${NC}"
    exit 1
fi

echo -e "${GREEN}Infrastructure is running!${NC}"

# 2. Start Microservices
SERVICES=("user-service" "product-service" "cart-service" "order-service" "payment-service" "delivery-service" "notification-service" "analytics-service" "api-gateway")

# Port mappings for local development
declare -A PORTS
PORTS["user-service"]=8081
PORTS["product-service"]=8082
PORTS["order-service"]=8083
PORTS["cart-service"]=8084
PORTS["payment-service"]=8085
PORTS["delivery-service"]=8086
PORTS["notification-service"]=8087
PORTS["analytics-service"]=8088
PORTS["api-gateway"]=8080

echo -e "\n${YELLOW}Step 2: Starting Microservices...${NC}"

# Function to start a service
start_service() {
    local service_name=$1
    local port=${PORTS[$service_name]}
    echo -e "${BLUE}Starting ${service_name} on port ${port}...${NC}"
    cd "services/${service_name}"

    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}  Installing dependencies for ${service_name}...${NC}"
        npm install > /dev/null 2>&1
    fi

    # Database initialization and Prisma generate
    if [ -f "prisma/schema.prisma" ]; then
        echo -e "${YELLOW}  Initializing database for ${service_name}...${NC}"
        # Use service-specific database name (defaulting to snake_case of service name)
        db_name=$(echo $service_name | sed 's/-/_/g' | sed 's/_service/_db/g')
        export DATABASE_URL="mysql://root:root_password@localhost:3306/$db_name"
        
        # Ensure database exists
        docker exec food-delivery-management-system-microservices--mysql-1 mysql -u root -proot_password -e "CREATE DATABASE IF NOT EXISTS $db_name;" > /dev/null 2>&1
        
        npx prisma generate > /dev/null 2>&1
        npx prisma db push --skip-generate > /dev/null 2>&1
    fi

    # Run in background with assigned port and correct DATABASE_URL
    db_name=$(echo $service_name | sed 's/-/_/g' | sed 's/_service/_db/g')
    DATABASE_URL="mysql://root:root_password@localhost:3306/$db_name" PORT=$port npm run dev > "../../logs/${service_name}.log" 2>&1 &
    cd ../..
}

# Create logs directory
mkdir -p logs

for service in "${SERVICES[@]}"; do
    start_service "$service"
done

echo -e "${GREEN}All services are starting in the background (check ./logs/ for details).${NC}"

# 3. Start Frontend
echo -e "\n${YELLOW}Step 3: Starting Frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
fi

# Run frontend in background or foreground?
# Let's run it in the background so the script can stay open for cleanup
npm run dev > "../logs/frontend.log" 2>&1 &
cd ..

echo -e "${GREEN}Frontend is starting!${NC}"
echo -e "\n${BLUE}Access Points:${NC}"
echo -e "🌐 Frontend:    http://localhost:3000"
echo -e "🚀 API Gateway: http://localhost:8080"
echo -e "🐰 RabbitMQ:    http://localhost:15672 (admin/admin123)"
echo -e "📝 Logs:        Check the ./logs/ directory"

echo -e "\n${YELLOW}Press Ctrl+C to stop all services...${NC}"

# Cleanup function to kill background processes
cleanup() {
    echo -e "\n${RED}Stopping all services...${NC}"
    pkill -P $$
    docker-compose -f docker-compose.infra.yml stop
    echo -e "${GREEN}Stopped.${NC}"
    exit
}

trap cleanup SIGINT

# Keep script running
while true; do sleep 1; done
