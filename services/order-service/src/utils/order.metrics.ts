import { Counter, Gauge } from 'prom-client';
import { config } from '../config/env';

const prefix = config.serviceName.replace(/-/g, '_');

// Order creation metrics
export const ordersCreatedTotal = new Counter({
  name: `${prefix}_orders_created_total`,
  help: 'Total number of orders created',
  labelNames: ['user_id'],
});

export const ordersCancelledTotal = new Counter({
  name: `${prefix}_orders_cancelled_total`,
  help: 'Total number of orders cancelled',
  labelNames: ['reason'],
});

// Order status metrics
export const orderStatusChanges = new Counter({
  name: `${prefix}_order_status_changes_total`,
  help: 'Total number of order status changes',
  labelNames: ['from_status', 'to_status'],
});

export const ordersByStatus = new Gauge({
  name: `${prefix}_orders_by_status`,
  help: 'Number of orders by status',
  labelNames: ['status'],
});

// Order value metrics
export const orderTotalValue = new Counter({
  name: `${prefix}_order_total_value`,
  help: 'Total value of all orders',
});

export const orderItemCount = new Counter({
  name: `${prefix}_order_items_total`,
  help: 'Total number of items in orders',
});

// Order errors
export const orderCreationErrors = new Counter({
  name: `${prefix}_order_creation_errors_total`,
  help: 'Total number of order creation errors',
  labelNames: ['error_type'],
});
