import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Delivery Service API',
      version: '1.0.0',
      description: `${config.serviceName} - Handles delivery assignment and tracking for food delivery system. 
      
This service listens to order events from RabbitMQ and manages delivery lifecycle.

## Events
### Consumed
- \`order.created\` - Creates a new delivery with ASSIGNED status
- \`order.cancelled\` - Updates delivery status to CANCELLED

### Published
- \`delivery.status.updated\` - Published when delivery status changes`,
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:8080/api/v1/deliveries`,
        description: 'Delivery Service via Ingress Gateway',
      },
    ],
    tags: [
      {
        name: 'Deliveries',
        description: 'Delivery management endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
