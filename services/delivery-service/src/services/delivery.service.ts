import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import {
  Delivery,
  DeliveryStatus,
  CreateDeliveryDto,
  UpdateDeliveryStatusDto,
} from '../types/delivery.types';
import { publishDeliveryStatusUpdated } from '../events/publisher';
import logger from '../utils/logger';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface DeliveryRow extends RowDataPacket {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  assignedAt: Date;
  updatedAt: Date;
}

export class DeliveryService {
  /**
   * Create a new delivery record
   */
  async createDelivery(dto: CreateDeliveryDto): Promise<Delivery> {
    const id = uuidv4();
    const now = new Date();

    try {
      await query<ResultSetHeader>(
        `INSERT INTO delivery (id, orderId, status, assignedAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?)`,
        [id, dto.orderId, DeliveryStatus.ASSIGNED, now, now]
      );

      const delivery: Delivery = {
        id,
        orderId: dto.orderId,
        status: DeliveryStatus.ASSIGNED,
        assignedAt: now,
        updatedAt: now,
      };

      logger.info(`Delivery created: ${id} for order: ${dto.orderId}`);
      return delivery;
    } catch (error: unknown) {
      // Check for duplicate entry (order already has a delivery)
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'ER_DUP_ENTRY'
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
    const rows = await query<DeliveryRow[]>(
      'SELECT id, orderId, status, assignedAt, updatedAt FROM delivery WHERE orderId = ?',
      [orderId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      orderId: row.orderId,
      status: row.status,
      assignedAt: row.assignedAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Get delivery by ID
   */
  async getDeliveryById(id: string): Promise<Delivery | null> {
    const rows = await query<DeliveryRow[]>(
      'SELECT id, orderId, status, assignedAt, updatedAt FROM delivery WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      orderId: row.orderId,
      status: row.status,
      assignedAt: row.assignedAt,
      updatedAt: row.updatedAt,
    };
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
    await query<ResultSetHeader>(
      'UPDATE delivery SET status = ?, updatedAt = NOW() WHERE orderId = ?',
      [newStatus, orderId]
    );

    // Get updated delivery
    const updatedDelivery = await this.getDeliveryByOrderId(orderId);

    if (updatedDelivery) {
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
    }

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
    await query<ResultSetHeader>(
      'UPDATE delivery SET status = ?, updatedAt = NOW() WHERE orderId = ?',
      [DeliveryStatus.CANCELLED, orderId]
    );

    // Get updated delivery
    const updatedDelivery = await this.getDeliveryByOrderId(orderId);

    if (updatedDelivery) {
      // Publish event
      await publishDeliveryStatusUpdated({
        deliveryId: updatedDelivery.id,
        orderId: updatedDelivery.orderId,
        oldStatus,
        newStatus: DeliveryStatus.CANCELLED,
      });

      logger.info(`Delivery ${updatedDelivery.id} cancelled`);
    }

    return updatedDelivery;
  }

  /**
   * Validate status transition
   */
  private isValidStatusTransition(
    from: DeliveryStatus,
    to: DeliveryStatus
  ): boolean {
    const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      [DeliveryStatus.ASSIGNED]: [
        DeliveryStatus.IN_TRANSIT,
        DeliveryStatus.CANCELLED,
      ],
      [DeliveryStatus.IN_TRANSIT]: [
        DeliveryStatus.DELIVERED,
        DeliveryStatus.CANCELLED,
      ],
      [DeliveryStatus.DELIVERED]: [], // Terminal state
      [DeliveryStatus.CANCELLED]: [], // Terminal state
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Get all deliveries (for debugging/admin)
   */
  async getAllDeliveries(): Promise<Delivery[]> {
    const rows = await query<DeliveryRow[]>(
      'SELECT id, orderId, status, assignedAt, updatedAt FROM delivery ORDER BY assignedAt DESC LIMIT 100'
    );

    return rows.map((row) => ({
      id: row.id,
      orderId: row.orderId,
      status: row.status,
      assignedAt: row.assignedAt,
      updatedAt: row.updatedAt,
    }));
  }
}

export const deliveryService = new DeliveryService();
