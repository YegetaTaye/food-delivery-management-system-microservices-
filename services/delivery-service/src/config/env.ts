import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  port: number;
  serviceName: string;
  nodeEnv: string;
  mysql: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  rabbitmq: {
    url: string;
  };
}

const getEnvConfig = (): EnvConfig => {
  return {
    port: parseInt(process.env.PORT || '4500', 10),
    serviceName: process.env.SERVICE_NAME || 'delivery-service',
    nodeEnv: process.env.NODE_ENV || 'development',
    mysql: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'delivery_db',
    },
    rabbitmq: {
      url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    },
  };
};

export const config = getEnvConfig();
