import { v4 as uuidv4 } from 'uuid';
import { getChannel, EXCHANGE_NAME } from '../config/rabbitmq';
import {
  DeliveryStatus,
  DeliveryStatusUpdatedEvent,
} from '../types/delivery.types';
import { config } from '../config/env';
import logger from '../utils/logger';

const ROUTING_KEY = 'delivery.status.updated';

interface PublishDeliveryStatusParams {
  deliveryId: string;
  orderId: string;
  oldStatus: DeliveryStatus;
  newStatus: DeliveryStatus;
  traceId?: string;
}

export const publishDeliveryStatusUpdated = async (
  params: PublishDeliveryStatusParams
): Promise<void> => {
  try {
    const channel = getChannel();

    const event: DeliveryStatusUpdatedEvent = {
      eventId: uuidv4(),
      version: 1,
      timestamp: new Date().toISOString(),
      source: config.serviceName,
      deliveryId: params.deliveryId,
      orderId: params.orderId,
      oldStatus: params.oldStatus,
      newStatus: params.newStatus,
      traceId: params.traceId || uuidv4(),
    };

    const messageBuffer = Buffer.from(JSON.stringify(event));

    channel.publish(EXCHANGE_NAME, ROUTING_KEY, messageBuffer, {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
      appId: config.serviceName,
    });

    logger.info(`Published event: ${ROUTING_KEY}`, {
      eventId: event.eventId,
      deliveryId: event.deliveryId,
      orderId: event.orderId,
      newStatus: event.newStatus,
    });
  } catch (error) {
    logger.error('Failed to publish delivery status updated event:', error);
    throw error;
  }
};
