import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  user_service_url: process.env.USER_SERVICE_URL || 'http://localhost:8081',
  product_service_url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:8082',
  order_service_url: process.env.ORDER_SERVICE_URL || 'http://localhost:8083',
  cart_service_url: process.env.CART_SERVICE_URL || 'http://localhost:8084',
  payment_service_url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:8085',
  delivery_service_url: process.env.DELIVERY_SERVICE_URL || 'http://localhost:8086',
  notification_service_url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8087',
  analytics_service_url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8088',
};
