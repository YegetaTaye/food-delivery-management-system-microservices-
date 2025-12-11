import { Request, Response, NextFunction } from 'express';
import { JwtUtil, JwtPayload } from '../utils/jwt.util';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization as string;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Please authenticate.'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = JwtUtil.verifyToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please authenticate again.'
    });
  }
};

export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = JwtUtil.verifyToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};
