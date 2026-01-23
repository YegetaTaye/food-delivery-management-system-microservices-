import { Router, Request, Response } from 'express';
import { getMetricsRegistry } from '../utils/metrics';

const router = Router();

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Prometheus metrics endpoint
 *     description: Returns Prometheus-formatted metrics for monitoring
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Prometheus metrics
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', getMetricsRegistry().contentType);
    res.end(await getMetricsRegistry().metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

export default router;
