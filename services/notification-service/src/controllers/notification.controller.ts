import { Request, Response, NextFunction } from 'express';
import { notificationStore } from '../services/notification.store';
import logger from '../utils/logger';

export class NotificationController {
  /**
   * Get all notifications
   * GET /notifications
   */
  getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const userId = req.query.userId as string;
      const eventName = req.query.eventName as string;

      let notifications;

      if (userId) {
        notifications = notificationStore.getNotificationsByUserId(userId, limit);
      } else if (eventName) {
        notifications = notificationStore.getNotificationsByEventName(eventName, limit);
      } else {
        notifications = notificationStore.getNotifications(limit);
      }

      res.status(200).json({
        success: true,
        data: notifications,
        count: notifications.length,
        total: notificationStore.getCount(),
      });
    } catch (error) {
      logger.error('Error getting notifications:', error);
      next(error);
    }
  }

  /**
   * Get notification statistics
   * GET /notifications/stats
   */
  getStats(
    _req: Request,
    res: Response,
    next: NextFunction
  ): void {
    try {
      const allNotifications = notificationStore.getNotifications(1000);
      
      // Group by event name
      const eventCounts: Record<string, number> = {};
      allNotifications.forEach((n) => {
        eventCounts[n.eventName] = (eventCounts[n.eventName] || 0) + 1;
      });

      res.status(200).json({
        success: true,
        data: {
          total: notificationStore.getCount(),
          byEventType: eventCounts,
        },
      });
    } catch (error) {
      logger.error('Error getting notification stats:', error);
      next(error);
    }
  }
}

export const notificationController = new NotificationController();

