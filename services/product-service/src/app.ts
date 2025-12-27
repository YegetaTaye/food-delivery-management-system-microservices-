import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';
import menuRoutes from './routes/menu.route';
import categoryRoutes from './routes/category.route';
import healthRoute from './routes/health.route';
import logger from './utils/logger';
import { config } from './config/env';
import fs from 'fs';
import path from 'path';

const app: Application = express();

// Generate swagger.json file
const generateSwaggerJson = (): void => {
  const docsDir = path.join(__dirname, '../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  const swaggerPath = path.join(docsDir, 'swagger.json');
  fs.writeFileSync(swaggerPath, JSON.stringify(swaggerSpec, null, 2));
  logger.info(`Swagger documentation generated at ${swaggerPath}`);
};

generateSwaggerJson();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Swagger UI to work properly
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

app.use(express.json());

// Request logging
app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});



// Routes
app.use(`/api/${config.apiVersion}/menu-items`, menuRoutes);
app.use(`/api/${config.apiVersion}/categories`, categoryRoutes);
app.use('/', healthRoute);

// Serve swagger.json file
app.get('/swagger.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(undefined, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: `${config.serviceName} API Docs`,
  swaggerOptions: {
    url: '/swagger.json',
    persistAuthorization: true,
  },
}));

// 404 handler
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
