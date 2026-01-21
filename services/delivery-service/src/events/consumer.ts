import { ConsumeMessage } from 'amqplib';
import { getChannel, EXCHANGE_NAME } from '../config/rabbitmq';
import { deliveryService } from '../services/delivery.service';
import { OrderStatusUpdatedEvent, OrderCancelledEvent } from '../types/delivery.types';
import logger from '../utils/logger';

const QUEUE_NAME = 'delivery-service.order-events';

// Routing keys to consume
const ORDER_STATUS_UPDATED_KEY = 'order.status.updated';
const ORDER_CANCELLED_KEY = 'order.cancelled';

export const startEventConsumer = async (): Promise<void> => {
  try {
    const channel = getChannel();

    // Declare queue for this service
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      deadLetterExchange: '', // Could add DLQ later
    });

    // Bind queue to exchange with routing keys
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ORDER_STATUS_UPDATED_KEY);
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ORDER_CANCELLED_KEY);

    logger.info(`✅ Queue '${QUEUE_NAME}' bound to exchange '${EXCHANGE_NAME}'`);
    logger.info(`   - Listening for: ${ORDER_STATUS_UPDATED_KEY}, ${ORDER_CANCELLED_KEY}`);

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

        switch (routingKey) {
          case ORDER_STATUS_UPDATED_KEY:
            await handleOrderStatusUpdated(event as OrderStatusUpdatedEvent);
            break;
          case ORDER_CANCELLED_KEY:
            await handleOrderCancelled(event as OrderCancelledEvent);
            break;
          default:
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

    logger.info('✅ Event consumer started successfully');
  } catch (error) {
    logger.error('Failed to start event consumer:', error);
    throw error;
  }
};

/**
 * Handle order.status.updated event
 * Creates a delivery when order is CONFIRMED
 */
const handleOrderStatusUpdated = async (event: OrderStatusUpdatedEvent): Promise<void> => {
  logger.info(`Processing order.status.updated for order: ${event.orderId}`, {
    status: event.status,
  });

  try {
    // Only create delivery when order is CONFIRMED (payment successful)
    if (event.status === 'CONFIRMED') {
      const delivery = await deliveryService.createDelivery({
        orderId: event.orderId,
      });

      logger.info(`Delivery ${delivery.id} created for confirmed order ${event.orderId}`, {
        deliveryId: delivery.id,
        status: delivery.status,
        traceId: event.traceId,
      });
    } else {
      logger.debug(`Ignoring order.status.updated with status: ${event.status}`);
    }
  } catch (error) {
    logger.error(`Failed to process order status update for order: ${event.orderId}`, error);
    throw error;
  }
};

/**
 * Handle order.cancelled event
 * Updates delivery status to CANCELLED
 */
const handleOrderCancelled = async (event: OrderCancelledEvent): Promise<void> => {
  logger.info(`Processing order.cancelled for order: ${event.orderId}`);

  try {
    const delivery = await deliveryService.cancelDelivery(event.orderId);

    if (delivery) {
      logger.info(`Delivery ${delivery.id} cancelled for order ${event.orderId}`, {
        deliveryId: delivery.id,
        status: delivery.status,
        reason: event.reason,
        traceId: event.traceId,
      });
    } else {
      logger.warn(`No delivery found to cancel for order: ${event.orderId}`);
    }
  } catch (error) {
    logger.error(`Failed to cancel delivery for order: ${event.orderId}`, error);
    throw error;
  }
};

