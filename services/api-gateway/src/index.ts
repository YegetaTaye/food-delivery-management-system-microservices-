import express from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'api-gateway' });
});

// Proxy routes
// Auth & Users
app.use('/api/auth', proxy(config.user_service_url, {
  proxyReqPathResolver: (req) => `/api/v1/auth${req.url}`
}));
app.use('/api/users', proxy(config.user_service_url, {
  proxyReqPathResolver: (req) => `/api/v1/users${req.url}`
}));

// Products & Menu
app.use('/api/v1/products', proxy(config.product_service_url, {
  proxyReqPathResolver: (req) => `/api/v1/menu-items${req.url}`
}));
app.use('/api/v1/categories', proxy(config.product_service_url, {
  proxyReqPathResolver: (req) => `/api/v1/categories${req.url}`
}));

// Orders
app.use('/api/v1/orders', proxy(config.order_service_url, {
  proxyReqPathResolver: (req) => `/api/v1/orders${req.url}`
}));

// Cart
app.use('/api/v1/cart', proxy(config.cart_service_url, {
  proxyReqPathResolver: (req) => `/api/v1/cart${req.url}`
}));

// Payment
app.use('/api/v1/payments', proxy(config.payment_service_url, {
  proxyReqPathResolver: (req) => `/api/v1/payments${req.url}`
}));

// Fallback
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Gateway: Route not found' });
});

app.listen(config.port, () => {
  console.log(`🚀 API Gateway running on port ${config.port}`);
});
