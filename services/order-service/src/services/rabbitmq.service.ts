import * as amqp from 'amqplib';
import { config } from '../config/env';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

class RabbitMQService {
  private connection: any = null;
  private channel: any = null;
  private readonly exchange = 'orders.events';
  private readonly exchangeType = 'topic';

  async connect(): Promise<void> {
    try {
      const conn = await amqp.connect(config.rabbitmqUrl);
      this.connection = conn;
      const ch = await conn.createChannel();
      this.channel = ch;
      
      await ch.assertExchange(this.exchange, this.exchangeType, {
        durable: true,
      });

      logger.info(`✅ RabbitMQ connected to exchange: ${this.exchange}`);

      // Handle connection close
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
  }

  async publishEvent(eventType: string, payload: any): Promise<void> {
    if (!this.channel) {
      logger.error('RabbitMQ channel not initialized');
      throw new Error('RabbitMQ channel not initialized');
    }

    const event = {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date().toISOString(),
      ...payload,
    };

    const routingKey = eventType;

    try {
      this.channel.publish(
        this.exchange,
        routingKey,
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
      );

      logger.info(`📤 Published event: ${eventType}`, { eventId: event.eventId });
    } catch (error) {
      logger.error(`Failed to publish event ${eventType}:`, error);
      throw error;
    }
  }

  getChannel(): amqp.Channel | null {
    return this.channel;
  }

  getExchange(): string {
    return this.exchange;
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
    }
  }
}

export default new RabbitMQService();
