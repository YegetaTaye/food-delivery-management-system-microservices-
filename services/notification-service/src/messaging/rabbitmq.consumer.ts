import { ConsumeMessage } from 'amqplib';
import { getChannel, EXCHANGE_NAME } from '../config/rabbitmq';
import { notificationStore } from '../services/notification.store';
import {
  OrderCreatedEvent,
  OrderStatusUpdatedEvent,
  PaymentCompletedEvent,
  DeliveryStatusUpdatedEvent,
} from '../types/notification.types';
import logger from '../utils/logger';

const QUEUE_NAME = 'notification-service.events';

// Routing keys to consume
const ORDER_CREATED_KEY = 'order.created';
const ORDER_STATUS_UPDATED_KEY = 'order.status.updated';
const PAYMENT_COMPLETED_KEY = 'payment.completed';
const DELIVERY_STATUS_UPDATED_KEY = 'delivery.status.updated';

export const startEventConsumer = async (): Promise<void> => {
  try {
    const channel = getChannel();

    // Declare queue for this service
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
    });

    // Bind queue to exchange with routing keys
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ORDER_CREATED_KEY);
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ORDER_STATUS_UPDATED_KEY);
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, PAYMENT_COMPLETED_KEY);
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, DELIVERY_STATUS_UPDATED_KEY);

    logger.info(`✅ Queue '${QUEUE_NAME}' bound to exchange '${EXCHANGE_NAME}'`);
    logger.info(`   - Listening for: ${ORDER_CREATED_KEY}, ${ORDER_STATUS_UPDATED_KEY}, ${PAYMENT_COMPLETED_KEY}, ${DELIVERY_STATUS_UPDATED_KEY}`);

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

        logger.info(`Received event: ${routingKey}`, {
          eventId: event.eventId,
        });

        switch (routingKey) {
          case ORDER_CREATED_KEY:
            await handleOrderCreated(event as OrderCreatedEvent);
            break;
          case ORDER_STATUS_UPDATED_KEY:
            await handleOrderStatusUpdated(event as OrderStatusUpdatedEvent);
            break;
          case PAYMENT_COMPLETED_KEY:
            await handlePaymentCompleted(event as PaymentCompletedEvent);
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

    logger.info('✅ Event consumer started successfully');
  } catch (error) {
    logger.error('Failed to start event consumer:', error);
    throw error;
  }
};

/**
 * Handle order.created event
 */
const handleOrderCreated = async (event: OrderCreatedEvent): Promise<void> => {
  const totalAmount = typeof event.totalAmount === 'string' ? parseFloat(event.totalAmount) : event.totalAmount;
  const message = `Your order #${event.orderId} has been created successfully! Total: $${totalAmount.toFixed(2)}`;
  
  notificationStore.addNotification(
    event.userId,
    'order.created',
    message,
    {
      orderId: event.orderId,
      total: totalAmount,
      itemCount: event.items.length,
    }
  );
};

/**
 * Handle order.status.updated event
 */
const handleOrderStatusUpdated = async (event: OrderStatusUpdatedEvent): Promise<void> => {
  const statusMessages: Record<string, string> = {
    CONFIRMED: 'Your order has been confirmed and is being prepared.',
    PREPARING: 'Your order is being prepared by the restaurant.',
    READY: 'Your order is ready for pickup!',
    OUT_FOR_DELIVERY: 'Your order is on its way!',
    DELIVERED: 'Your order has been delivered. Enjoy your meal!',
    CANCELLED: 'Your order has been cancelled.',
  };

  const message = statusMessages[event.status] || 
    `Your order status has been updated to ${event.status}.`;
  
  notificationStore.addNotification(
    event.userId,
    'order.status.updated',
    message,
    {
      orderId: event.orderId,
      status: event.status,
    }
  );
};

/**
 * Handle payment.completed event
 */
const handlePaymentCompleted = async (event: PaymentCompletedEvent): Promise<void> => {
  const message = `Payment of $${event.amount.toFixed(2)} for order #${event.orderId} was successful. Thank you!`;
  
  notificationStore.addNotification(
    event.userId,
    'payment.completed',
    message,
    {
      paymentId: event.paymentId,
      orderId: event.orderId,
      amount: event.amount,
      method: event.method,
    }
  );
};

/**
 * Handle delivery.status.updated event
 */
const handleDeliveryStatusUpdated = async (event: DeliveryStatusUpdatedEvent): Promise<void> => {
  const statusMessages: Record<string, string> = {
    ASSIGNED: 'A driver has been assigned to your order!',
    PICKED_UP: 'Your order has been picked up and is on the way!',
    IN_TRANSIT: 'Your order is in transit.',
    DELIVERED: 'Your order has been delivered. Enjoy your meal!',
    CANCELLED: 'Delivery has been cancelled.',
    FAILED: 'Delivery attempt failed. We will contact you shortly.',
  };

  const message = statusMessages[event.newStatus] || 
    `Delivery status updated to ${event.newStatus}.`;
  
  notificationStore.addNotification(
    event.userId,
    'delivery.status.updated',
    message,
    {
      deliveryId: event.deliveryId,
      orderId: event.orderId,
      status: event.newStatus,
      driverId: event.driverId,
      estimatedDeliveryTime: event.estimatedDeliveryTime,
    }
  );
};

