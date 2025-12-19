import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import logger from '../utils/logger';

export class OrderController {
  static async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const order = await OrderService.createOrder(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error: any) {
      logger.error('Error in createOrder controller:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create order',
      });
    }
  }

  static async cancelOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const order = await OrderService.cancelOrder(id, userId);

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      });
    } catch (error: any) {
      logger.error('Error in cancelOrder controller:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel order',
      });
    }
  }

  static async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await OrderService.updateOrderStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error: any) {
      logger.error('Error in updateOrderStatus controller:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update order status',
      });
    }
  }

  static async getOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const orders = await OrderService.getOrders(userId);

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
      });
    } catch (error: any) {
      logger.error('Error in getOrders controller:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch orders',
      });
    }
  }

  static async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const order = await OrderService.getOrderById(id, userId);

      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order,
      });
    } catch (error: any) {
      logger.error('Error in getOrderById controller:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch order',
      });
    }
  }
}
