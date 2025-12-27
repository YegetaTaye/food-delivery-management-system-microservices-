import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  port: number;
  serviceName: string;
  nodeEnv: string;
  rabbitmq: {
    url: string;
  };
}

const getEnvConfig = (): EnvConfig => {
  return {
    port: parseInt(process.env.PORT || '4600', 10),
    serviceName: process.env.SERVICE_NAME || 'notification-service',
    nodeEnv: process.env.NODE_ENV || 'development',
    rabbitmq: {
      url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    },
  };
};

export const config = getEnvConfig();
