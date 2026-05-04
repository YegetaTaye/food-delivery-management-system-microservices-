import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization as string;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Please include Bearer token in Authorization header',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as {
        userId: string;
        email: string;
        role: string;
        iat?: number;
        exp?: number;
      };

      req.user = decoded;
      logger.info(`User authenticated: ${decoded.userId}`);
      next();
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: 'Token expired. Please login again',
        });
        return;
      }

      if (jwtError.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again',
        });
        return;
      }

      throw jwtError;
    }
  } catch (error: any) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};
