import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the service
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: MicroserviceName
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', HealthController.getHealth);

export default router;
