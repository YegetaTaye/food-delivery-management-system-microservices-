import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { config } from '../config/env';
import logger from '../utils/logger';
import rabbitmqService from './rabbitmq.service';

const prisma = new PrismaClient();

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface CreateOrderData {
  items: OrderItem[];
}

export class OrderService {
  static async createOrder(userId: string, data: CreateOrderData) {
    try {
      // 1. Validate stock with product-service (synchronous call)
      await this.validateStock(data.items);

      // 2. Calculate total amount
      const totalAmount = data.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // 3. Create order in database
      const order = await prisma.order.create({
        data: {
          userId,
          status: 'PENDING',
          totalAmount,
          orderItems: {
            create: data.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      logger.info(`Order created: ${order.id}`, { userId, orderId: order.id });

      // 4. Publish order.created event to RabbitMQ (asynchronous)
      await rabbitmqService.publishEvent('order.created', {
        orderId: order.id,
        userId: order.userId,
        totalAmount: order.totalAmount.toString(),
        items: order.orderItems,
      });

      return order;
    } catch (error: any) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  static async cancelOrder(orderId: string, userId: string) {
    try {
      // Find order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.userId !== userId) {
        throw new Error('Unauthorized to cancel this order');
      }

      if (order.status === 'CANCELLED') {
        throw new Error('Order already cancelled');
      }

      // Update status to CANCELLED
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
        include: { orderItems: true },
      });

      logger.info(`Order cancelled: ${orderId}`, { userId });

      // Publish order.cancellation event
      await rabbitmqService.publishEvent('order.cancellation', {
        orderId: updatedOrder.id,
        userId: updatedOrder.userId,
        items: updatedOrder.orderItems,
      });

      return updatedOrder;
    } catch (error: any) {
      logger.error('Error cancelling order:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId: string, status: string) {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: status as any },
        include: { orderItems: true },
      });

      logger.info(`Order status updated: ${orderId}`, { status });

      // Publish order.status.updated event
      await rabbitmqService.publishEvent('order.status.updated', {
        orderId: order.id,
        userId: order.userId,
        status: order.status,
      });

      return order;
    } catch (error: any) {
      logger.error('Error updating order status:', error);
      throw error;
    }
  }

  static async getOrders(userId: string) {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: { orderItems: true },
        orderBy: { createdAt: 'desc' },
      });

      return orders;
    } catch (error: any) {
      logger.error('Error fetching orders:', error);
      throw error;
    }
  }

  static async getOrderById(orderId: string, userId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.userId !== userId) {
        throw new Error('Unauthorized to view this order');
      }

      return order;
    } catch (error: any) {
      logger.error('Error fetching order:', error);
      throw error;
    }
  }

  private static async validateStock(items: OrderItem[]): Promise<void> {
    try {
      // Call product-service to validate stock availability
      for (const item of items) {
        const response = await axios.get(
          `${config.productServiceUrl}/menu-items/${item.productId}`
        );

        const product = response.data.data;

        if (!product.isAvailable) {
          throw new Error(`Product ${item.productName} is not available`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.productName}. Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }
      }

      logger.info('Stock validation successful');
    } catch (error: any) {
      logger.error('Stock validation failed:', error);
      if (error.response) {
        throw new Error(`Product service error: ${error.response.data.message || error.message}`);
      }
      throw error;
    }
  }
}
