import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  port: number;
  serviceName: string;
  nodeEnv: string;
}

const getEnvConfig = (): EnvConfig => {
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    serviceName: process.env.SERVICE_NAME || 'order-service',
    nodeEnv: process.env.NODE_ENV || 'development',
  };
};

export const config = getEnvConfig();
