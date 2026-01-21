import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';
import path from 'path';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: config.serviceName,
      version: '1.0.0',
      description: `${config.serviceName} API Documentation - Coordinates User and Product services`,
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:8080/api/${config.apiVersion}/orders`,
        description: 'Order Service via Ingress Gateway',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from user-service (without Bearer prefix)',
        },
      },
    },
    security: [],
    tags: [
      {
        name: 'Orders',
        description: 'Order management endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoint',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),  // For development with ts-node
    path.join(__dirname, '../routes/*.js'),  // For production (compiled)
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
