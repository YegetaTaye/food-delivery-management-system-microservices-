import { v4 as uuidv4 } from 'uuid';
import { Notification } from '../types/notification.types';
import logger from '../utils/logger';

// In-memory notification store
const notifications: Notification[] = [];
const MAX_NOTIFICATIONS = 1000;

export class NotificationStore {
  /**
   * Add a notification to the in-memory store
   */
  addNotification(
    userId: string,
    eventName: string,
    message: string,
    metadata: Record<string, unknown> = {}
  ): Notification {
    const notification: Notification = {
      id: uuidv4(),
      userId,
      eventName,
      message,
      metadata,
      createdAt: new Date(),
    };

    // Add to beginning for most recent first
    notifications.unshift(notification);

    // Keep store bounded
    if (notifications.length > MAX_NOTIFICATIONS) {
      notifications.pop();
    }

    logger.info(`📧 Notification sent to user ${userId} for event ${eventName}`, {
      notificationId: notification.id,
      userId,
      eventName,
    });

    return notification;
  }

  /**
   * Get all notifications
   */
  getNotifications(limit: number = 100): Notification[] {
    return notifications.slice(0, limit);
  }

  /**
   * Get notifications for a specific user
   */
  getNotificationsByUserId(userId: string, limit: number = 50): Notification[] {
    return notifications
      .filter((n) => n.userId === userId)
      .slice(0, limit);
  }

  /**
   * Get notifications by event name
   */
  getNotificationsByEventName(eventName: string, limit: number = 50): Notification[] {
    return notifications
      .filter((n) => n.eventName === eventName)
      .slice(0, limit);
  }

  /**
   * Get notification count
   */
  getCount(): number {
    return notifications.length;
  }

  /**
   * Clear all notifications (for testing)
   */
  clear(): void {
    notifications.length = 0;
  }
}

export const notificationStore = new NotificationStore();

