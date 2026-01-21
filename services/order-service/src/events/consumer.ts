import { ConsumeMessage } from 'amqplib';
import rabbitmqService from '../services/rabbitmq.service';
import { OrderService } from '../services/order.service';
import logger from '../utils/logger';

const QUEUE_NAME = 'order-service.events';

// Routing keys to consume
const PAYMENT_COMPLETED_KEY = 'payment.completed';
const PAYMENT_FAILED_KEY = 'payment.failed';
const DELIVERY_STATUS_UPDATED_KEY = 'delivery.status.updated';

interface PaymentEvent {
  eventId: string;
  paymentId: string;
  orderId: string;
  userId: string;
  status: 'SUCCESS' | 'FAILED';
  amount: number;
  failureReason?: string;
  traceId?: string;
}

interface DeliveryStatusUpdatedEvent {
  eventId: string;
  deliveryId: string;
  orderId: string;
  oldStatus: string;
  newStatus: string;
  traceId?: string;
}

// Map delivery status to order status
const deliveryToOrderStatusMap: Record<string, string> = {
  'ASSIGNED': 'CONFIRMED',
  'PICKED_UP': 'PREPARING',
  'IN_TRANSIT': 'OUT_FOR_DELIVERY',
  'DELIVERED': 'DELIVERED',
  'CANCELLED': 'CANCELLED',
};

export const startEventConsumer = async (): Promise<void> => {
  try {
    const channel = rabbitmqService.getChannel();
    const exchange = rabbitmqService.getExchange();

    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    // Declare queue for this service
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
    });

    // Bind queue to exchange with routing keys
    await channel.bindQueue(QUEUE_NAME, exchange, PAYMENT_COMPLETED_KEY);
    await channel.bindQueue(QUEUE_NAME, exchange, PAYMENT_FAILED_KEY);
    await channel.bindQueue(QUEUE_NAME, exchange, DELIVERY_STATUS_UPDATED_KEY);

    logger.info(`✅ Queue '${QUEUE_NAME}' bound to exchange '${exchange}'`);
    logger.info(`   - Listening for: ${PAYMENT_COMPLETED_KEY}, ${PAYMENT_FAILED_KEY}, ${DELIVERY_STATUS_UPDATED_KEY}`);

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
          case PAYMENT_COMPLETED_KEY:
            await handlePaymentCompleted(event as PaymentEvent);
            break;
          case PAYMENT_FAILED_KEY:
            await handlePaymentFailed(event as PaymentEvent);
            break;
          case DELIVERY_STATUS_UPDATED_KEY:
            await handleDeliveryStatusUpdated(event as DeliveryStatusUpdatedEvent);
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

    logger.info('✅ Order event consumer started successfully');
  } catch (error) {
    logger.error('Failed to start event consumer:', error);
    throw error;
  }
};

/**
 * Handle payment.completed event
 * Update order status to CONFIRMED
 */
const handlePaymentCompleted = async (event: PaymentEvent): Promise<void> => {
  logger.info(`Processing payment.completed for order: ${event.orderId}`, {
    paymentId: event.paymentId,
    status: event.status,
  });

  try {
    await OrderService.updateOrderStatus(event.orderId, 'CONFIRMED');
    logger.info(`Order ${event.orderId} status updated to CONFIRMED`);
  } catch (error) {
    logger.error(`Failed to update order status for: ${event.orderId}`, error);
    throw error;
  }
};

/**
 * Handle payment.failed event
 * Update order status to CANCELLED
 */
const handlePaymentFailed = async (event: PaymentEvent): Promise<void> => {
  logger.info(`Processing payment.failed for order: ${event.orderId}`, {
    paymentId: event.paymentId,
    failureReason: event.failureReason,
  });

  try {
    await OrderService.updateOrderStatus(event.orderId, 'CANCELLED');
    logger.info(`Order ${event.orderId} status updated to CANCELLED due to payment failure`);
  } catch (error) {
    logger.error(`Failed to update order status for: ${event.orderId}`, error);
    throw error;
  }
};

/**
 * Handle delivery.status.updated event
 * Sync order status with delivery status
 */
const handleDeliveryStatusUpdated = async (event: DeliveryStatusUpdatedEvent): Promise<void> => {
  logger.info(`Processing delivery.status.updated for order: ${event.orderId}`, {
    deliveryId: event.deliveryId,
    oldStatus: event.oldStatus,
    newStatus: event.newStatus,
  });

  try {
    const orderStatus = deliveryToOrderStatusMap[event.newStatus];
    
    if (orderStatus) {
      await OrderService.updateOrderStatus(event.orderId, orderStatus);
      logger.info(`Order ${event.orderId} status synced to ${orderStatus} based on delivery status ${event.newStatus}`);
    } else {
      logger.warn(`No order status mapping for delivery status: ${event.newStatus}`);
    }
  } catch (error) {
    logger.error(`Failed to sync order status for: ${event.orderId}`, error);
    throw error;
  }
};
