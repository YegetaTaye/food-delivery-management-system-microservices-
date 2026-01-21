import { ConsumeMessage } from 'amqplib';
import { getChannel, EXCHANGE_NAME } from '../config/rabbitmq';
import { PaymentService } from '../services/payment.service';
import { OrderCreatedEvent } from '../types/payment.types';
import logger from '../utils/logger';

const QUEUE_NAME = 'payment-service.order-events';
const ORDER_CREATED_KEY = 'order.created';

export const startEventConsumer = async (): Promise<void> => {
  try {
    const channel = getChannel();

    // Declare queue for this service
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
    });

    // Bind queue to exchange with routing key
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ORDER_CREATED_KEY);

    logger.info(`✅ Queue '${QUEUE_NAME}' bound to exchange '${EXCHANGE_NAME}'`);
    logger.info(`   - Listening for: ${ORDER_CREATED_KEY}`);

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
        const event = JSON.parse(content);

        logger.info(`📥 Received event: ${routingKey}`, {
          eventId: event.eventId,
          orderId: event.orderId,
        });

        if (routingKey === ORDER_CREATED_KEY) {
          await handleOrderCreated(event as OrderCreatedEvent);
        } else {
          logger.warn(`Unknown routing key: ${routingKey}`);
        }

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

    logger.info('✅ Payment event consumer started successfully');
  } catch (error) {
    logger.error('Failed to start event consumer:', error);
    throw error;
  }
};

/**
 * Handle order.created event
 * Process payment for the order
 */
const handleOrderCreated = async (event: OrderCreatedEvent): Promise<void> => {
  logger.info(`Processing order.created for order: ${event.orderId}`);

  try {
    await PaymentService.processPayment(event);
    logger.info(`Payment processing completed for order: ${event.orderId}`);
  } catch (error) {
    logger.error(`Failed to process payment for order: ${event.orderId}`, error);
    throw error;
  }
};
