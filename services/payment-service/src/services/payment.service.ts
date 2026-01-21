import { v4 as uuidv4 } from 'uuid';
import { OrderCreatedEvent, PaymentStatus, PaymentMethod } from '../types/payment.types';
import { publishPaymentResult } from '../events/publisher';
import logger from '../utils/logger';

// In-memory storage for payments (in production, use a database)
const payments: Map<string, any> = new Map();

export class PaymentService {
  /**
   * Process payment for an order
   * This simulates payment processing - in production, integrate with a real payment gateway
   */
  static async processPayment(event: OrderCreatedEvent): Promise<void> {
    const paymentId = uuidv4();
    const amount = parseFloat(event.totalAmount);

    logger.info(`Processing payment for order: ${event.orderId}`, {
      paymentId,
      amount,
      userId: event.userId,
    });

    // Simulate payment processing delay (1-2 seconds)
    await this.simulatePaymentDelay();

    // Simulate payment success/failure (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;

    // Store payment record
    const payment = {
      id: paymentId,
      orderId: event.orderId,
      userId: event.userId,
      amount,
      method: PaymentMethod.CARD,
      status: isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
      createdAt: new Date().toISOString(),
      failureReason: isSuccess ? null : 'Payment declined by bank',
    };

    payments.set(paymentId, payment);

    logger.info(`Payment ${isSuccess ? 'successful' : 'failed'} for order: ${event.orderId}`, {
      paymentId,
      status: payment.status,
    });

    // Publish payment result event
    await publishPaymentResult({
      paymentId,
      orderId: event.orderId,
      userId: event.userId,
      amount,
      method: PaymentMethod.CARD,
      success: isSuccess,
      traceId: event.traceId,
      failureReason: isSuccess ? undefined : 'Payment declined by bank',
    });
  }

  /**
   * Get payment by ID
   */
  static getPaymentById(paymentId: string): any | null {
    return payments.get(paymentId) || null;
  }

  /**
   * Get payment by order ID
   */
  static getPaymentByOrderId(orderId: string): any | null {
    for (const payment of payments.values()) {
      if (payment.orderId === orderId) {
        return payment;
      }
    }
    return null;
  }

  /**
   * Get all payments
   */
  static getAllPayments(): any[] {
    return Array.from(payments.values());
  }

  /**
   * Simulate payment processing delay
   */
  private static simulatePaymentDelay(): Promise<void> {
    const delay = 1000 + Math.random() * 1000; // 1-2 seconds
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
