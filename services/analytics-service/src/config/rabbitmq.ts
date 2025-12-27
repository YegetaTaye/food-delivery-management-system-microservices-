import amqp, { ChannelModel, Channel } from 'amqplib';
import { config } from './env';
import logger from '../utils/logger';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

const EXCHANGE_NAME = 'order.events';
const EXCHANGE_TYPE = 'direct';

// Retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const initializeRabbitMQ = async (): Promise<void> => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      logger.info(`Connecting to RabbitMQ at ${config.rabbitmq.url}...`);
      connection = await amqp.connect(config.rabbitmq.url);
      channel = await connection.createChannel();

      // Declare the exchange
      await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
        durable: true,
      });

      logger.info('✅ RabbitMQ connection established successfully');
      logger.info(`✅ Exchange '${EXCHANGE_NAME}' declared`);

      // Handle connection events
      connection.on('error', (err: Error) => {
        logger.error('RabbitMQ connection error:', err);
      });

      connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
      });

      return;
    } catch (error) {
      retries++;
      logger.error(`Failed to connect to RabbitMQ (attempt ${retries}/${MAX_RETRIES}):`, error);
      
      if (retries < MAX_RETRIES) {
        logger.info(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  throw new Error(`Failed to connect to RabbitMQ after ${MAX_RETRIES} attempts`);
};

export const getChannel = (): Channel => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized. Call initializeRabbitMQ() first.');
  }
  return channel;
};

export const getConnection = (): ChannelModel => {
  if (!connection) {
    throw new Error('RabbitMQ connection not initialized. Call initializeRabbitMQ() first.');
  }
  return connection;
};

export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    logger.info('RabbitMQ connection closed gracefully');
  } catch (error) {
    logger.error('Error closing RabbitMQ connection:', error);
  }
};

export { EXCHANGE_NAME, EXCHANGE_TYPE };

