import { prisma } from '../utils/prisma.util';
import { PasswordUtil } from '../utils/password.util';
import { JwtUtil, JwtPayload } from '../utils/jwt.util';
import { CreateUserDto, UserResponse } from '../types/user.types';
import * as crypto from 'crypto';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Convert User to UserResponse (exclude passwordHash)
   */
  private static toResponse(user: any): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
  }

  /**
   * Sign up a new user
   */
  static async signup(data: CreateUserDto): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const passwordHash = await PasswordUtil.hash(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        passwordHash
      }
    });

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email
    };

    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    return {
      user: this.toResponse(user),
      accessToken,
      refreshToken
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email
    };

    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    return {
      user: this.toResponse(user),
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const payload = JwtUtil.verifyToken(refreshToken);

      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const newPayload: JwtPayload = {
        userId: user.id,
        email: user.email
      };

      const accessToken = JwtUtil.generateAccessToken(newPayload);

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Verify access token and get user
   */
  static async verifyToken(accessToken: string): Promise<UserResponse> {
    try {
      const payload = JwtUtil.verifyToken(accessToken);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return this.toResponse(user);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await PasswordUtil.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await PasswordUtil.hash(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });
  }
}
