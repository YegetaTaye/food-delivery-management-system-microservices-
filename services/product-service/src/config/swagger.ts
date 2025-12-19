import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';
import path from 'path';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Food Delivery - Menu Service',
      version: '1.0.0',
      description: 'Menu items and categories API for food delivery platform',
    },
    servers: [{ url: `http://localhost:${config.port}/api/${config.apiVersion}` }],
    tags: [
      { name: 'Menu Items', description: 'Menu item CRUD operations' },
      { name: 'Categories', description: 'Category CRUD operations' },
      { name: 'Stock', description: 'Stock management operations' },
      { name: 'Health', description: 'Health check endpoint' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token from user service',
        },
      },
      schemas: {
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Category unique identifier',
            },
            name: {
              type: 'string',
              description: 'Category name',
              example: 'Main Courses',
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Category description',
              example: 'Hearty main dishes',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Menu item unique identifier',
            },
            name: {
              type: 'string',
              description: 'Menu item name',
              example: 'Margherita Pizza',
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Menu item description',
              example: 'Classic tomato sauce, mozzarella, and fresh basil',
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Price in currency units',
              example: 14.99,
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              nullable: true,
              description: 'Image URL',
              example: 'https://example.com/pizza.jpg',
            },
            stock: {
              type: 'integer',
              description: 'Available stock quantity',
              example: 50,
            },
            isAvailable: {
              type: 'boolean',
              description: 'Availability status',
              example: true,
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              description: 'Category ID',
            },
            category: {
              $ref: '#/components/schemas/Category',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        CreateCategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Category name',
              example: 'Appetizers',
            },
            description: {
              type: 'string',
              maxLength: 200,
              description: 'Category description',
              example: 'Starters and small bites',
            },
          },
        },
        UpdateCategoryRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Category name',
            },
            description: {
              type: 'string',
              maxLength: 200,
              description: 'Category description',
            },
          },
        },
        CreateMenuItemRequest: {
          type: 'object',
          required: ['name', 'price', 'categoryId'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Menu item name',
              example: 'Grilled Salmon',
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Menu item description',
              example: 'Fresh Atlantic salmon with lemon butter sauce',
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Price',
              example: 24.99,
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              description: 'Image URL',
              example: 'https://example.com/salmon.jpg',
            },
            stock: {
              type: 'integer',
              minimum: 0,
              default: 0,
              description: 'Stock quantity',
              example: 30,
            },
            isAvailable: {
              type: 'boolean',
              default: true,
              description: 'Availability status',
              example: true,
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              description: 'Category ID',
            },
          },
        },
        UpdateMenuItemRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Menu item name',
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Menu item description',
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Price',
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              description: 'Image URL',
            },
            stock: {
              type: 'integer',
              minimum: 0,
              description: 'Stock quantity',
            },
            isAvailable: {
              type: 'boolean',
              description: 'Availability status',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              description: 'Category ID',
            },
          },
        },
        StockOperationRequest: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              minItems: 1,
              description: 'List of items to update stock',
              items: {
                type: 'object',
                required: ['menuItemId', 'quantity'],
                properties: {
                  menuItemId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Menu item ID',
                  },
                  quantity: {
                    type: 'integer',
                    minimum: 1,
                    description: 'Quantity to reserve/release',
                    example: 2,
                  },
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'name',
                  },
                  message: {
                    type: 'string',
                    example: 'Name is required',
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        NotFound: {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        Conflict: {
          description: 'Conflict - Resource already exists',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),  // For development with ts-node
    path.join(__dirname, '../routes/*.js'),  // For production (compiled)
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
