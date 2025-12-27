import { Request, Response, NextFunction } from 'express';
import { deliveryService } from '../services/delivery.service';
import { DeliveryStatus, UpdateDeliveryStatusDto } from '../types/delivery.types';
import logger from '../utils/logger';

export class DeliveryController {
  /**
   * Get delivery by order ID
   * GET /deliveries/:orderId
   */
  async getDeliveryByOrderId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({
          success: false,
          error: 'Order ID is required',
        });
        return;
      }

      const delivery = await deliveryService.getDeliveryByOrderId(orderId);

      if (!delivery) {
        res.status(404).json({
          success: false,
          error: `Delivery not found for order: ${orderId}`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: delivery,
      });
    } catch (error) {
      logger.error('Error getting delivery:', error);
      next(error);
    }
  }

  /**
   * Update delivery status
   * PATCH /deliveries/:orderId/status
   */
  async updateDeliveryStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!orderId) {
        res.status(400).json({
          success: false,
          error: 'Order ID is required',
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'Status is required',
        });
        return;
      }

      // Validate status value
      const validStatuses = Object.values(DeliveryStatus);
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
        return;
      }

      const dto: UpdateDeliveryStatusDto = { status };
      const delivery = await deliveryService.updateDeliveryStatus(orderId, dto);

      if (!delivery) {
        res.status(404).json({
          success: false,
          error: `Delivery not found for order: ${orderId}`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: delivery,
        message: `Delivery status updated to ${status}`,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid status transition')) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }
      logger.error('Error updating delivery status:', error);
      next(error);
    }
  }

  /**
   * Get all deliveries (for debugging/admin)
   * GET /deliveries
   */
  async getAllDeliveries(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const deliveries = await deliveryService.getAllDeliveries();

      res.status(200).json({
        success: true,
        data: deliveries,
        count: deliveries.length,
      });
    } catch (error) {
      logger.error('Error getting all deliveries:', error);
      next(error);
    }
  }
}

export const deliveryController = new DeliveryController();

