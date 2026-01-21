import * as amqp from 'amqplib';
import { config } from './env';
import logger from '../utils/logger';

let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;

export const EXCHANGE_NAME = 'orders.events';
const EXCHANGE_TYPE = 'topic';

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    const conn = await amqp.connect(config.rabbitmqUrl);
    connection = conn;
    const ch = await conn.createChannel();
    channel = ch;

    await ch.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
      durable: true,
    });

    logger.info(`✅ RabbitMQ connected to exchange: ${EXCHANGE_NAME}`);

    conn.on('close', () => {
      logger.warn('RabbitMQ connection closed');
    });

    conn.on('error', (error: Error) => {
      logger.error('RabbitMQ connection error:', error);
    });
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
};

export const getChannel = (): amqp.Channel => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
};

export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    logger.info('RabbitMQ connection closed');
  } catch (error) {
    logger.error('Error closing RabbitMQ connection:', error);
  }
};
