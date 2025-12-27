import Joi from 'joi';

export const createMenuItemSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow('', null),
  price: Joi.number().positive().required(),
  imageUrl: Joi.string().uri().allow('', null),
  stock: Joi.number().integer().min(0).default(0),
  isAvailable: Joi.boolean().default(true),
  categoryId: Joi.string().uuid().required(),
});

export const updateMenuItemSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500).allow('', null),
  price: Joi.number().positive(),
  imageUrl: Joi.string().uri().allow('', null),
  stock: Joi.number().integer().min(0),
  isAvailable: Joi.boolean(),
  categoryId: Joi.string().uuid(),
}).min(1);

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).allow('', null),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50),
  description: Joi.string().max(200).allow('', null),
}).min(1);

export const stockUpdateSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      menuItemId: Joi.string().uuid().required(),
      quantity: Joi.number().integer().positive().required(),
    })
  ).min(1).required(),
});
