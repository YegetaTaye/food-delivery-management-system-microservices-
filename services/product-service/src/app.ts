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

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/menu-items', menuRoutes);
app.use('/categories', categoryRoutes);
app.use('/', healthRoute);

// Swagger docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: `${config.serviceName} API Docs`,
}));

// 404 handler
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
