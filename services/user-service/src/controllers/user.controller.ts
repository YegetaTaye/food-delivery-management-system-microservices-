import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import logger from '../utils/logger';

export class UserController {
  /**
   * Create a new user
   * POST /api/users
   */
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error: any) {
      logger.error('Error creating user:', error);
      
      if (error.message === 'Email already exists') {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }

  /**
   * Get all users with pagination
   * GET /api/users?page=1&limit=10
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await UserService.getAllUsers(page, limit);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      logger.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.updateUser(id, req.body);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error: any) {
      logger.error('Error updating user:', error);

      if (error.message === 'User not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error.message === 'Email already exists') {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error deleting user:', error);

      if (error.message === 'User not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  /**
   * Search users
   * GET /api/users/search?q=query&page=1&limit=10
   */
  static async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      const result = await UserService.searchUsers(query, page, limit);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Error searching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search users'
      });
    }
  }
}
