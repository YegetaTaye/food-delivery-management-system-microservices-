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
  database: {
    url: string;
  };
}

const getEnvConfig = (): EnvConfig => {
  return {
    port: parseInt(process.env.PORT || '4700', 10),
    serviceName: process.env.SERVICE_NAME || 'analytics-service',
    nodeEnv: process.env.NODE_ENV || 'development',
    rabbitmq: {
      url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    },
    database: {
      url:
        process.env.DATABASE_URL ||
        'mysql://root:password@localhost:3306/analytics_db',
    },
  };
};

export const config = getEnvConfig();
