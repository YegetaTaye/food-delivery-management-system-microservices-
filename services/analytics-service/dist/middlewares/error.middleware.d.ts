import { Request, Response, NextFunction } from 'express';
export declare const errorHandler: (error: Error & {
    status?: number;
    statusCode?: number;
}, req: Request, res: Response, _next: NextFunction) => Response;
//# sourceMappingURL=error.middleware.d.ts.map