"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const env_1 = require("./env");
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Analytics Service API',
            version: '1.0.0',
            description: `${env_1.config.serviceName} - Collects system events and stores them for analytics/reporting.
      
This is an event-driven service that consumes events from RabbitMQ and persists them to MySQL for analytics.

## Events Consumed (via RabbitMQ)

| Event | Routing Key | Description |
|-------|-------------|-------------|
| Order Created | \`order.created\` | New order placed |
| Order Cancelled | \`order.cancelled\` | Order cancelled |
| Order Status Updated | \`order.status.updated\` | Order status changed |
| Payment Completed | \`payment.completed\` | Payment processed |

## Data Model

Events are stored with:
- \`eventType\`: The type of event
- \`sourceService\`: Which service published the event
- \`payload\`: Full event data as JSON
- \`createdAt\`: When the event was received`,
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: `http://localhost:${env_1.config.port}`,
                description: 'Development server',
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
    apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
//# sourceMappingURL=swagger.js.map