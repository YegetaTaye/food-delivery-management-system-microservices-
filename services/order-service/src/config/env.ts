import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  port: number;
  serviceName: string;
  nodeEnv: string;
  apiVersion: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  rabbitmqUrl: string;
  productServiceUrl: string;
  userServiceUrl: string;
}

const getEnvConfig = (): EnvConfig => {
  return {
    port: parseInt(process.env.PORT || '3004', 10),
    serviceName: process.env.SERVICE_NAME || 'order-service',
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    databaseUrl: process.env.DATABASE_URL || '',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    productServiceUrl: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002/api/v1',
    userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3000/api/v1',
  };
};

export const config = getEnvConfig();
