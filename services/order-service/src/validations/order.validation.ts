import Joi from 'joi';

export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().messages({
          'string.empty': 'Product ID is required',
          'any.required': 'Product ID is required',
        }),
        productName: Joi.string().required().messages({
          'string.empty': 'Product name is required',
          'any.required': 'Product name is required',
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          'number.base': 'Quantity must be a number',
          'number.min': 'Quantity must be at least 1',
          'any.required': 'Quantity is required',
        }),
        price: Joi.number().positive().required().messages({
          'number.base': 'Price must be a number',
          'number.positive': 'Price must be positive',
          'any.required': 'Price is required',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one item is required',
      'any.required': 'Items array is required',
    }),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'CONFIRMED', 'CANCELLED')
    .required()
    .messages({
      'string.empty': 'Status is required',
      'any.required': 'Status is required',
      'any.only': 'Status must be one of: PENDING, CONFIRMED, CANCELLED',
    }),
});
