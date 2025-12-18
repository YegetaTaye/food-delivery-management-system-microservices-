import { prisma } from '../utils/prisma.util';
import { PasswordUtil } from '../utils/password.util';
import { CreateUserDto, UpdateUserDto, UserResponse } from '../types/user.types';
import * as crypto from 'crypto';

export class UserService {
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
   * Create a new user
   */
  static async createUser(data: CreateUserDto): Promise<UserResponse> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        passwordHash: await PasswordUtil.hash(data.password)
      }
    });

    return this.toResponse(user);
  }

  /**
   * Get all users with pagination
   */
  static async getAllUsers(page: number = 1, limit: number = 10): Promise<{
    users: UserResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    return {
      users: users.map(this.toResponse),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    return user ? this.toResponse(user) : null;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    return user ? this.toResponse(user) : null;
  }

  /**
   * Update user
   */
  static async updateUser(id: string, data: UpdateUserDto): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // If email is being updated, check if new email already exists
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.passwordHash = await PasswordUtil.hash(data.password);

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return this.toResponse(user);
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.user.delete({
      where: { id }
    });
  }

  /**
   * Search users by name or email
   */
  static async searchUsers(query: string, page: number = 1, limit: number = 10): Promise<{
    users: UserResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } }
          ]
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({
        where: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } }
          ]
        }
      })
    ]);

    return {
      users: users.map(this.toResponse),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}
