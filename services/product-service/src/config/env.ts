import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  port: number;
  apiVersion: string;
  serviceName: string;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
}

const getEnvConfig = (): EnvConfig => {
  return {
    port: parseInt(process.env.PORT || '4300', 10),
    apiVersion: process.env.API_VERSION || 'v1',
    serviceName: process.env.SERVICE_NAME || 'product-service',
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/product_service',
    jwtSecret: process.env.JWT_SECRET || 'foodflow-secret-key-2024-dev',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  };
};

export const config = getEnvConfig();
