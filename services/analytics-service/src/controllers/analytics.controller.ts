import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import logger from '../utils/logger';

export class AnalyticsController {
  /**
   * Get all events
   * GET /analytics/events
   */
  getEvents(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const sourceService = req.query.sourceService as string;
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;

      const startDate = startDateStr ? new Date(startDateStr) : undefined;
      const endDate = endDateStr ? new Date(endDateStr) : undefined;

      const result = analyticsService.getEvents({
        sourceService,
        startDate,
        endDate,
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        data: result.events,
        pagination: {
          total: result.total,
          limit,
          offset,
          hasMore: offset + result.events.length < result.total,
        },
      });
    } catch (error) {
      logger.error('Error getting events:', error);
      next(error);
    }
  }

  /**
   * Get events by type
   * GET /analytics/events/:type
   */
  getEventsByType(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    try {
      const { type } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;

      if (!type) {
        res.status(400).json({
          success: false,
          error: 'Event type is required',
        });
        return;
      }

      const events = analyticsService.getEventsByType(type, limit);

      res.status(200).json({
        success: true,
        data: events,
        count: events.length,
        eventType: type,
      });
    } catch (error) {
      logger.error('Error getting events by type:', error);
      next(error);
    }
  }

  /**
   * Get event statistics
   * GET /analytics/stats
   */
  getStatistics(
    _req: Request,
    res: Response,
    next: NextFunction
  ): void {
    try {
      const stats = analyticsService.getStatistics();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting statistics:', error);
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();

