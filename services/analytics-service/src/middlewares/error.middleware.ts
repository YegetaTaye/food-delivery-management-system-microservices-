import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface ErrorResponse {
  message: string;
  status?: number;
  stack?: string;
}

export const errorHandler = (
  error: Error & { status?: number; statusCode?: number },
  req: Request,
  res: Response,
  _next: NextFunction
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

