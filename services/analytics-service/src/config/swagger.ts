import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { config } from './env';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Analytics Service API',
      version: '1.0.0',
      description: `${config.serviceName} - Collects system events and stores them for analytics/reporting.
      
This is an event-driven service that consumes events from RabbitMQ and stores them in-memory for analytics.

## Events Consumed (via RabbitMQ)

| Event | Routing Key | Description |
|-------|-------------|-------------|
| Order Created | \`order.created\` | New order placed |
| Order Cancelled | \`order.cancelled\` | Order cancelled |
| Order Status Updated | \`order.status.updated\` | Order status changed |
| Payment Completed | \`payment.completed\` | Payment processed |

## Data Model

Events are stored in-memory with:
- \`eventType\`: The type of event
- \`sourceService\`: Which service published the event
- \`payload\`: Full event data as JSON
- \`createdAt\`: When the event was received

**Note:** In-memory storage (max 10,000 events). Data is lost on pod restart.`,
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:8080`,
        description: 'API Gateway',
      },
    ],
    tags: [
      {
        name: 'Analytics',
        description: 'Analytics event endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js'), path.join(__dirname, '../routes/*.ts')],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
