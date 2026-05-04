import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export class JwtUtil {
  private static readonly SECRET = process.env.JWT_SECRET || 'foodflow-secret-key-2024-dev';
  private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private static readonly REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  /**
   * Generate access token
   */
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.SECRET, {
      expiresIn: this.EXPIRES_IN,
      issuer: config.serviceName
    } as jwt.SignOptions);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.SECRET, {
      expiresIn: this.REFRESH_EXPIRES_IN,
      issuer: config.serviceName
    } as jwt.SignOptions);
  }

  /**
   * Verify token
   */
  static verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.SECRET, {
        issuer: config.serviceName
      }) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Decode token without verification (use with caution)
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}
