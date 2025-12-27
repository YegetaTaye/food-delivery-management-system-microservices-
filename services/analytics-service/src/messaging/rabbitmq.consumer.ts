import { ConsumeMessage } from 'amqplib';
import { getChannel, EXCHANGE_NAME } from '../config/rabbitmq';
import { analyticsService } from '../services/analytics.service';
import { DomainEvent } from '../types/analytics.types';
import logger from '../utils/logger';

const QUEUE_NAME = 'analytics-service.events';

// Routing keys to consume
const ORDER_CREATED_KEY = 'order.created';
const ORDER_CANCELLED_KEY = 'order.cancelled';
const ORDER_STATUS_UPDATED_KEY = 'order.status.updated';
const PAYMENT_COMPLETED_KEY = 'payment.completed';

export const startEventConsumer = async (): Promise<void> => {
  try {
    const channel = getChannel();

    // Declare queue for this service
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
    });

    // Bind queue to exchange with routing keys
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ORDER_CREATED_KEY);
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ORDER_CANCELLED_KEY);
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ORDER_STATUS_UPDATED_KEY);
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, PAYMENT_COMPLETED_KEY);

    logger.info(`✅ Queue '${QUEUE_NAME}' bound to exchange '${EXCHANGE_NAME}'`);
    logger.info(`   - Listening for: ${ORDER_CREATED_KEY}, ${ORDER_CANCELLED_KEY}, ${ORDER_STATUS_UPDATED_KEY}, ${PAYMENT_COMPLETED_KEY}`);

    // Set prefetch to process one message at a time
    await channel.prefetch(1);

    // Start consuming
    await channel.consume(QUEUE_NAME, async (msg: ConsumeMessage | null) => {
      if (!msg) {
        return;
      }

      const routingKey = msg.fields.routingKey;
      
      try {
        const content = msg.content.toString();
        const event: DomainEvent = JSON.parse(content);

        logger.info(`Received event: ${routingKey}`, {
          eventId: 'eventId' in event ? event.eventId : 'unknown',
        });

        // Store the event in database
        await analyticsService.storeEvent(
          routingKey,
          event.source || 'unknown',
          event as unknown as Record<string, unknown>
        );

        // Acknowledge message
        channel.ack(msg);
        logger.debug(`Message acknowledged: ${routingKey}`);
      } catch (error) {
        logger.error(`Error processing message: ${routingKey}`, error);
        
        // Negative acknowledge - requeue if first attempt, otherwise discard
        const requeue = !msg.fields.redelivered;
        channel.nack(msg, false, requeue);
        
        if (!requeue) {
          logger.warn(`Message discarded after retry: ${routingKey}`);
        }
      }
    });

    logger.info('✅ Event consumer started successfully');
  } catch (error) {
    logger.error('Failed to start event consumer:', error);
    throw error;
  }
};

