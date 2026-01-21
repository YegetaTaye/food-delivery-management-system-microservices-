import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AnalyticsEvent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique event identifier
 *         eventType:
 *           type: string
 *           description: Type of the event
 *           enum: [order.created, order.cancelled, order.status.updated, payment.completed]
 *         sourceService:
 *           type: string
 *           description: Service that published the event
 *         payload:
 *           type: object
 *           description: Full event data
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the event was stored
 *     EventListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AnalyticsEvent'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             limit:
 *               type: integer
 *             offset:
 *               type: integer
 *             hasMore:
 *               type: boolean
 *     EventsByTypeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AnalyticsEvent'
 *         count:
 *           type: integer
 *         eventType:
 *           type: string
 *     StatisticsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             totalEvents:
 *               type: integer
 *             byEventType:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *             bySourceService:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 */

/**
 * @swagger
 * tags:
 *   - name: Analytics
 *     description: Analytics event endpoints
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all analytics events
 *     description: Retrieve stored analytics events with optional filtering (in-memory store)
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of events to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of events to skip
 *       - in: query
 *         name: sourceService
 *         schema:
 *           type: string
 *         description: Filter by source service
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events before this date
 *     responses:
 *       200:
 *         description: List of analytics events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventListResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/events', analyticsController.getEvents.bind(analyticsController));

/**
 * @swagger
 * /events/{type}:
 *   get:
 *     summary: Get events by type
 *     description: Retrieve analytics events filtered by event type (in-memory store)
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Event type (e.g., order.created, payment.completed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of events to return
 *     responses:
 *       200:
 *         description: List of events for the specified type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventsByTypeResponse'
 *       400:
 *         description: Event type is required
 *       500:
 *         description: Internal server error
 */
router.get('/events/:type', analyticsController.getEventsByType.bind(analyticsController));

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get event statistics
 *     description: Get counts of events grouped by type and source service (in-memory store)
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Event statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatisticsResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/stats', analyticsController.getStatistics.bind(analyticsController));

export default router;

