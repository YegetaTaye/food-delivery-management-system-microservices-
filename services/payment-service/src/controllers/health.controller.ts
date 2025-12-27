import { Request, Response } from 'express';
import { config } from '../config/env';

/**
 * Health check controller
 */
export class HealthController {
  /**
   * GET /health
   * Returns the health status of the service
   */
  public static getHealth(req: Request, res: Response): Response {
    return res.status(200).json({
      status: 'ok',
      service: config.serviceName,
      timestamp: new Date().toISOString(),
    });
  }
}
