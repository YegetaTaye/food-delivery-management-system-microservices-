import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface ErrorResponse {
  message: string;
  status?: number;
  stack?: string;
}

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log the error
  logger.error(`Error: ${message}`, {
    status,
    path: req.path,
    method: req.method,
    stack: error.stack,
  });

  const response: ErrorResponse = {
    message,
    status,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  return res.status(status).json(response);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
