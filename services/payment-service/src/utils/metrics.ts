import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram, Gauge, register, collectDefaultMetrics } from 'prom-client';
import { config } from '../config/env';

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({
  prefix: `${config.serviceName.replace(/-/g, '_')}_`,
  labels: { service: config.serviceName },
});

// HTTP request metrics
export const httpRequestDuration = new Histogram({
  name: `${config.serviceName.replace(/-/g, '_')}_http_request_duration_seconds`,
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const httpRequestTotal = new Counter({
  name: `${config.serviceName.replace(/-/g, '_')}_http_requests_total`,
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestErrors = new Counter({
  name: `${config.serviceName.replace(/-/g, '_')}_http_request_errors_total`,
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'error_type'],
});

// RabbitMQ consumer metrics
export const rabbitmqMessagesReceived = new Counter({
  name: `${config.serviceName.replace(/-/g, '_')}_rabbitmq_messages_received_total`,
  help: 'Total number of RabbitMQ messages received',
  labelNames: ['routing_key', 'status'],
});

export const rabbitmqMessageProcessingDuration = new Histogram({
  name: `${config.serviceName.replace(/-/g, '_')}_rabbitmq_message_processing_duration_seconds`,
  help: 'Duration of RabbitMQ message processing in seconds',
  labelNames: ['routing_key'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

// Active connections
export const activeConnections = new Gauge({
  name: `${config.serviceName.replace(/-/g, '_')}_active_connections`,
  help: 'Number of active connections',
  labelNames: ['type'],
});

/**
 * Middleware to track HTTP request metrics
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Get route pattern (not the actual path with params)
  const route = req.route?.path || req.path;
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const statusCode = res.statusCode.toString();
    
    httpRequestDuration.observe(
      { method: req.method, route, status_code: statusCode },
      duration
    );
    
    httpRequestTotal.inc({ method: req.method, route, status_code: statusCode });
    
    // Track errors (4xx and 5xx)
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      httpRequestErrors.inc({ method: req.method, route, error_type: errorType });
    }
  });
  
  next();
};

/**
 * Get Prometheus metrics registry
 */
export const getMetricsRegistry = () => register;

/**
 * Track RabbitMQ message
 */
export const trackRabbitMQMessage = (
  routingKey: string,
  status: 'success' | 'error',
  duration: number
): void => {
  rabbitmqMessagesReceived.inc({ routing_key: routingKey, status });
  rabbitmqMessageProcessingDuration.observe({ routing_key: routingKey }, duration);
};
