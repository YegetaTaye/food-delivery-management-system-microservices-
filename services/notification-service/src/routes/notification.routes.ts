import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique notification identifier
 *         userId:
 *           type: string
 *           description: User who received the notification
 *         eventName:
 *           type: string
 *           description: Event that triggered the notification
 *           enum: [order.created, order.status.updated, payment.completed]
 *         message:
 *           type: string
 *           description: Notification message content
 *         metadata:
 *           type: object
 *           description: Additional event data
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the notification was created
 *     NotificationListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *         count:
 *           type: integer
 *           description: Number of notifications returned
 *         total:
 *           type: integer
 *           description: Total notifications in store
 *     NotificationStatsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             byEventType:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 */

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Notification endpoints (in-memory store)
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get all notifications
 *     description: Retrieve notifications from in-memory store. Supports filtering by userId or eventName.
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of notifications to return
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: eventName
 *         schema:
 *           type: string
 *           enum: [order.created, order.status.updated, payment.completed, delivery.status.updated]
 *         description: Filter by event name
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/', notificationController.getNotifications.bind(notificationController));

/**
 * @swagger
 * /api/v1/notifications/stats:
 *   get:
 *     summary: Get notification statistics
 *     description: Get counts of notifications grouped by event type
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Notification statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationStatsResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/stats', notificationController.getStats.bind(notificationController));

export default router;

