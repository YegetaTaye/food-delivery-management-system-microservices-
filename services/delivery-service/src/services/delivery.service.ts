import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/db';
import {
  Delivery,
  DeliveryStatus,
  CreateDeliveryDto,
  UpdateDeliveryStatusDto,
} from '../types/delivery.types';
import { publishDeliveryStatusUpdated } from '../events/publisher';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

export class DeliveryService {
  /**
   * Create a new delivery record
   */
  async createDelivery(dto: CreateDeliveryDto): Promise<Delivery> {
    const id = uuidv4();

    try {
      const delivery = await prisma.delivery.create({
        data: {
          id,
          orderId: dto.orderId,
          status: DeliveryStatus.ASSIGNED,
        },
      });

      logger.info(`Delivery created: ${id} for order: ${dto.orderId}`);
      return delivery;
    } catch (error: unknown) {
      // Check for duplicate entry (order already has a delivery)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        logger.warn(`Delivery already exists for order: ${dto.orderId}`);
        const existing = await this.getDeliveryByOrderId(dto.orderId);
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }

  /**
   * Get delivery by order ID
   */
  async getDeliveryByOrderId(orderId: string): Promise<Delivery | null> {
    const delivery = await prisma.delivery.findUnique({
      where: { orderId },
    });

    return delivery;
  }

  /**
   * Get delivery by ID
   */
  async getDeliveryById(id: string): Promise<Delivery | null> {
    const delivery = await prisma.delivery.findUnique({
      where: { id },
    });

    return delivery;
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    orderId: string,
    dto: UpdateDeliveryStatusDto
  ): Promise<Delivery | null> {
    // Get current delivery
    const delivery = await this.getDeliveryByOrderId(orderId);

    if (!delivery) {
      logger.warn(`Delivery not found for order: ${orderId}`);
      return null;
    }

    const oldStatus = delivery.status;
    const newStatus = dto.status;

    // Validate status transition
    if (!this.isValidStatusTransition(oldStatus, newStatus)) {
      throw new Error(
        `Invalid status transition from ${oldStatus} to ${newStatus}`
      );
    }

    // Update in database
    const updatedDelivery = await prisma.delivery.update({
      where: { orderId },
      data: { status: newStatus },
    });

    // Publish event
    await publishDeliveryStatusUpdated({
      deliveryId: updatedDelivery.id,
      orderId: updatedDelivery.orderId,
      oldStatus,
      newStatus,
    });

    logger.info(
      `Delivery ${updatedDelivery.id} status updated: ${oldStatus} -> ${newStatus}`
    );

    return updatedDelivery;
  }

  /**
   * Cancel delivery (called when order is cancelled)
   */
  async cancelDelivery(orderId: string): Promise<Delivery | null> {
    const delivery = await this.getDeliveryByOrderId(orderId);

    if (!delivery) {
      logger.warn(`Cannot cancel: Delivery not found for order: ${orderId}`);
      return null;
    }

    // Only cancel if not already delivered
    if (delivery.status === DeliveryStatus.DELIVERED) {
      logger.warn(
        `Cannot cancel: Delivery ${delivery.id} is already delivered`
      );
      return delivery;
    }

    if (delivery.status === DeliveryStatus.CANCELLED) {
      logger.info(`Delivery ${delivery.id} is already cancelled`);
      return delivery;
    }

    const oldStatus = delivery.status;

    // Update status to cancelled
    const updatedDelivery = await prisma.delivery.update({
      where: { orderId },
      data: { status: DeliveryStatus.CANCELLED },
    });

    // Publish event
    await publishDeliveryStatusUpdated({
      deliveryId: updatedDelivery.id,
      orderId: updatedDelivery.orderId,
      oldStatus,
      newStatus: DeliveryStatus.CANCELLED,
    });

    logger.info(`Delivery ${updatedDelivery.id} cancelled`);

    return updatedDelivery;
  }

  /**
   * Validate status transition
   */
  private isValidStatusTransition(
    from: DeliveryStatus,
    to: DeliveryStatus
  ): boolean {
    const validTransitions: Partial<Record<DeliveryStatus, DeliveryStatus[]>> = {
      PENDING: ['ASSIGNED', 'CANCELLED'],
      ASSIGNED: ['PICKED_UP', 'CANCELLED'],
      PICKED_UP: ['IN_TRANSIT', 'CANCELLED'],
      IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
      DELIVERED: [], // Terminal state
      CANCELLED: [], // Terminal state
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Get all deliveries (for debugging/admin)
   */
  async getAllDeliveries(): Promise<Delivery[]> {
    const deliveries = await prisma.delivery.findMany({
      orderBy: { assignedAt: 'desc' },
      take: 100,
    });

    return deliveries;
  }
}

export const deliveryService = new DeliveryService();
