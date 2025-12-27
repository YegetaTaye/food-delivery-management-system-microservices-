#!/usr/bin/env python3
"""
Verification script to ensure all Payment Service requirements are implemented.
This script checks the codebase for required components.
"""

import os
import sys
from pathlib import Path

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        print(f"{GREEN}✓{RESET} {description}: {filepath}")
        return True
    else:
        print(f"{RED}✗{RESET} {description}: {filepath} - NOT FOUND")
        return False

def check_content_in_file(filepath, content, description):
    """Check if content exists in file"""
    try:
        with open(filepath, 'r') as f:
            file_content = f.read()
            if content in file_content:
                print(f"{GREEN}✓{RESET} {description}")
                return True
            else:
                print(f"{RED}✗{RESET} {description} - NOT FOUND")
                return False
    except FileNotFoundError:
        print(f"{RED}✗{RESET} {description} - FILE NOT FOUND: {filepath}")
        return False

def main():
    print("=" * 70)
    print("Payment Service Implementation Verification")
    print("=" * 70)
    print()
    
    checks_passed = 0
    checks_total = 0
    
    # Check project structure
    print("📁 Project Structure")
    print("-" * 70)
    
    files_to_check = [
        ("app/main.py", "Main FastAPI application"),
        ("app/api/payments.py", "Payment API endpoints"),
        ("app/models/payment.py", "Payment database model"),
        ("app/db/session.py", "Database session management"),
        ("app/messaging/publisher.py", "RabbitMQ event publisher"),
        ("app/consumer.py", "RabbitMQ event consumer"),
        ("app/core/config.py", "Configuration settings"),
        ("Dockerfile", "Docker container definition"),
        ("docker-compose.yml", "Docker Compose configuration"),
        ("requirements.txt", "Python dependencies"),
        ("k8s/deployment.yaml", "Kubernetes deployment"),
        ("k8s/service.yaml", "Kubernetes service"),
        ("k8s/configmap.yaml", "Kubernetes ConfigMap"),
        ("k8s/secret.yaml", "Kubernetes Secret"),
    ]
    
    for filepath, description in files_to_check:
        checks_total += 1
        if check_file_exists(filepath, description):
            checks_passed += 1
    
    print()
    
    # Check API endpoints
    print("🔌 API Endpoints")
    print("-" * 70)
    
    api_checks = [
        ("app/api/payments.py", "POST /payments", '@router.post('),
        ("app/api/payments.py", "GET /payments/{id}", '@router.get('),
        ("app/main.py", "GET /health", '@app.get("/health")'),
    ]
    
    for filepath, description, content in api_checks:
        checks_total += 1
        if check_content_in_file(filepath, content, description):
            checks_passed += 1
    
    print()
    
    # Check database model
    print("🗄️ Database Model")
    print("-" * 70)
    
    model_checks = [
        ("app/models/payment.py", "UUID id field", 'id = Column'),
        ("app/models/payment.py", "order_id field", 'order_id = Column'),
        ("app/models/payment.py", "amount field", 'amount = Column'),
        ("app/models/payment.py", "status field", 'status = Column'),
        ("app/models/payment.py", "method field", 'method = Column'),
        ("app/models/payment.py", "created_at field", 'created_at = Column'),
        ("app/models/payment.py", "PaymentStatus enum", 'class PaymentStatus'),
        ("app/models/payment.py", "PaymentMethod enum", 'class PaymentMethod'),
    ]
    
    for filepath, description, content in model_checks:
        checks_total += 1
        if check_content_in_file(filepath, content, description):
            checks_passed += 1
    
    print()
    
    # Check RabbitMQ integration
    print("📨 RabbitMQ Integration")
    print("-" * 70)
    
    rabbitmq_checks = [
        ("app/messaging/publisher.py", "Publish payment events", 'def publish_payment_event'),
        ("app/consumer.py", "Consume order events", 'def process_order_created'),
        ("app/consumer.py", "Start consumer", 'def start_consumer'),
        ("app/consumer.py", "Message callback", 'def callback'),
    ]
    
    for filepath, description, content in rabbitmq_checks:
        checks_total += 1
        if check_content_in_file(filepath, content, description):
            checks_passed += 1
    
    print()
    
    # Check configuration
    print("⚙️ Configuration")
    print("-" * 70)
    
    config_checks = [
        ("app/core/config.py", "DATABASE_URL", 'DATABASE_URL'),
        ("app/core/config.py", "RABBITMQ_URL", 'RABBITMQ_URL'),
        ("app/core/config.py", "RABBITMQ_EXCHANGE", 'RABBITMQ_EXCHANGE'),
        ("app/core/config.py", "RABBITMQ_QUEUE", 'RABBITMQ_QUEUE'),
    ]
    
    for filepath, description, content in config_checks:
        checks_total += 1
        if check_content_in_file(filepath, content, description):
            checks_passed += 1
    
    print()
    
    # Check dependencies
    print("📦 Dependencies")
    print("-" * 70)
    
    dependency_checks = [
        ("requirements.txt", "FastAPI", 'fastapi'),
        ("requirements.txt", "Uvicorn", 'uvicorn'),
        ("requirements.txt", "SQLAlchemy", 'sqlalchemy'),
        ("requirements.txt", "PyMySQL", 'pymysql'),
        ("requirements.txt", "Pika (RabbitMQ)", 'pika'),
        ("requirements.txt", "Pydantic", 'pydantic'),
    ]
    
    for filepath, description, content in dependency_checks:
        checks_total += 1
        if check_content_in_file(filepath, content, description):
            checks_passed += 1
    
    print()
    
    # Check documentation
    print("📚 Documentation")
    print("-" * 70)
    
    doc_files = [
        ("README.md", "Main documentation"),
        ("SETUP.md", "Setup guide"),
        ("API.md", "API documentation"),
        ("ARCHITECTURE.md", "Architecture details"),
        ("REQUIREMENTS_CHECKLIST.md", "Requirements checklist"),
    ]
    
    for filepath, description in doc_files:
        checks_total += 1
        if check_file_exists(filepath, description):
            checks_passed += 1
    
    print()
    
    # Summary
    print("=" * 70)
    print("Summary")
    print("=" * 70)
    
    percentage = (checks_passed / checks_total) * 100
    
    print(f"Checks Passed: {checks_passed}/{checks_total} ({percentage:.1f}%)")
    print()
    
    if checks_passed == checks_total:
        print(f"{GREEN}✓ All requirements implemented successfully!{RESET}")
        print()
        print("Next steps:")
        print("1. Start services: docker-compose up -d")
        print("2. Test API: ./test_api.sh")
        print("3. Test events: python test_events.py")
        print("4. View docs: http://localhost:8003/docs")
        return 0
    else:
        print(f"{RED}✗ Some requirements are missing.{RESET}")
        print(f"Please review the failed checks above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
