import { Request, Response } from 'express';
import { config } from '../config/env';

export class HealthController {
  public static getHealth(req: Request, res: Response): Response {
    return res.json({
      status: 'ok',
      service: config.serviceName,
      timestamp: new Date().toISOString(),
    });
  }
}
