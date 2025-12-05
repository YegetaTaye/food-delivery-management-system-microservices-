import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

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
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'], // Support both TS and compiled JS
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
