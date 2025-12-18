import { Request, Response, NextFunction } from 'express';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'boolean';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export const validateRequest = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: { field: string; message: string }[] = [];
    const data = req.body;

    for (const rule of rules) {
      const value = data[rule.field];

      // Check required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: rule.field,
          message: rule.message || `${rule.field} is required`
        });
        continue;
      }

      // Skip further validation if field is optional and not provided
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Check type
      if (rule.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({
            field: rule.field,
            message: rule.message || `${rule.field} must be a valid email`
          });
        }
      } else if (rule.type === 'string' && typeof value !== 'string') {
        errors.push({
          field: rule.field,
          message: rule.message || `${rule.field} must be a string`
        });
      } else if (rule.type === 'number' && typeof value !== 'number') {
        errors.push({
          field: rule.field,
          message: rule.message || `${rule.field} must be a number`
        });
      }

      // Check minLength
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errors.push({
          field: rule.field,
          message: rule.message || `${rule.field} must be at least ${rule.minLength} characters`
        });
      }

      // Check maxLength
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push({
          field: rule.field,
          message: rule.message || `${rule.field} must be at most ${rule.maxLength} characters`
        });
      }

      // Check pattern
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push({
          field: rule.field,
          message: rule.message || `${rule.field} format is invalid`
        });
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
      return;
    }

    next();
  };
};

// Specific validators
export const createUserValidator = validateRequest([
  { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 255 },
  { field: 'email', required: true, type: 'email', maxLength: 255 },
  { field: 'password', required: true, type: 'string', minLength: 8, maxLength: 100 }
]);

export const updateUserValidator = validateRequest([
  { field: 'name', required: false, type: 'string', minLength: 2, maxLength: 255 },
  { field: 'email', required: false, type: 'email', maxLength: 255 },
  { field: 'password', required: false, type: 'string', minLength: 8, maxLength: 100 }
]);
