import Joi from 'joi';

export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 255 characters'
  }),
  email: Joi.string().email().max(255).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'string.max': 'Email must not exceed 255 characters'
  }),
  password: Joi.string().min(8).max(100).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 100 characters'
  })
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 255 characters'
  }),
  email: Joi.string().email().max(255).optional().messages({
    'string.email': 'Email must be a valid email address',
    'string.max': 'Email must not exceed 255 characters'
  }),
  password: Joi.string().min(8).max(100).optional().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 100 characters'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});

export const signupSchema = createUserSchema;
