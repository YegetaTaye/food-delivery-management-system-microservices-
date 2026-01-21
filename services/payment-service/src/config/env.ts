import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  port: number;
  serviceName: string;
  nodeEnv: string;
  rabbitmqUrl: string;
}

const getEnvConfig = (): EnvConfig => {
  return {
    port: parseInt(process.env.PORT || '3004', 10),
    serviceName: process.env.SERVICE_NAME || 'payment-service',
    nodeEnv: process.env.NODE_ENV || 'development',
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  };
};

export const config = getEnvConfig();
