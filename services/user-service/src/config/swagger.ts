import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';
import path from 'path';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: config.serviceName,
      version: '1.0.0',
      description: `${config.serviceName} API Documentation`,
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: your-token-here (without Bearer prefix)'
        }
      }
    },
    security: []
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),  // For development with ts-node
    path.join(__dirname, '../routes/*.js'),  // For production (compiled)
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
