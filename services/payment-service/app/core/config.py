from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/payment_db"
    
    # RabbitMQ
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"
    RABBITMQ_EXCHANGE: str = "food_delivery"
    RABBITMQ_QUEUE: str = "payment_queue"
    
    # Service
    SERVICE_NAME: str = "payment-service"
    SERVICE_PORT: int = 8003
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
