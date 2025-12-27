import { Request, Response, NextFunction } from 'express';
export declare class AnalyticsController {
    getEvents(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEventsByType(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStatistics(_req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const analyticsController: AnalyticsController;
//# sourceMappingURL=analytics.controller.d.ts.map