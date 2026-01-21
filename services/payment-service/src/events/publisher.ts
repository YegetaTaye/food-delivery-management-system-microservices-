import { v4 as uuidv4 } from 'uuid';
import { getChannel, EXCHANGE_NAME } from '../config/rabbitmq';
import { PaymentCompletedEvent } from '../types/payment.types';
import { config } from '../config/env';
import logger from '../utils/logger';

const PAYMENT_COMPLETED_KEY = 'payment.completed';
const PAYMENT_FAILED_KEY = 'payment.failed';

interface PublishPaymentResultParams {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  method: string;
  success: boolean;
  traceId?: string;
  failureReason?: string;
}

export const publishPaymentResult = async (
  params: PublishPaymentResultParams
): Promise<void> => {
  try {
    const channel = getChannel();

    const routingKey = params.success ? PAYMENT_COMPLETED_KEY : PAYMENT_FAILED_KEY;

    const event: PaymentCompletedEvent = {
      eventId: uuidv4(),
      version: 1,
      timestamp: new Date().toISOString(),
      source: config.serviceName,
      paymentId: params.paymentId,
      orderId: params.orderId,
      userId: params.userId,
      status: params.success ? 'SUCCESS' : 'FAILED',
      amount: params.amount,
      method: params.method,
      traceId: params.traceId || uuidv4(),
      failureReason: params.failureReason,
    };

    const messageBuffer = Buffer.from(JSON.stringify(event));

    channel.publish(EXCHANGE_NAME, routingKey, messageBuffer, {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
      appId: config.serviceName,
    });

    logger.info(`📤 Published event: ${routingKey}`, {
      eventId: event.eventId,
      paymentId: event.paymentId,
      orderId: event.orderId,
      status: event.status,
    });
  } catch (error) {
    logger.error('Failed to publish payment result event:', error);
    throw error;
  }
};
