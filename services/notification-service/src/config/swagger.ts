import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notification Service API',
      version: '1.0.0',
      description: `${config.serviceName} - Listens to domain events and simulates sending notifications.
      
This is an event-driven service that consumes events from RabbitMQ and logs notifications.

## Events Consumed (via RabbitMQ)

| Event | Routing Key | Description |
|-------|-------------|-------------|
| Order Created | \`order.created\` | New order placed |
| Order Status Updated | \`order.status.updated\` | Order status changed |
| Payment Completed | \`payment.completed\` | Payment processed |

## How It Works

1. Events are consumed from the \`order.events\` exchange
2. Each event triggers a simulated notification
3. Notifications are stored in-memory and logged
4. No actual email/SMS is sent (simulation only)`,
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
    tags: [
      {
        name: 'Notifications',
        description: 'Notification management endpoints',
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
