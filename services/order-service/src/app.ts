import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';
import healthRoute from './routes/health.route';
import orderRoutes from './routes/order.routes';
import logger from './utils/logger';
import { config } from './config/env';
import fs from 'fs';
import path from 'path';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.generateSwaggerJson();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));
    
    // CORS middleware - Allow all origins for development
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86400 // 24 hours
    }));
    
    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req: Request, _res: Response, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check route
    this.app.use('/', healthRoute);
    
    // Serve swagger.json file
    this.app.get('/api/v1/orders/swagger.json', (_req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    
    // Swagger documentation (before auth routes to allow public access)
    this.app.use('/api/v1/orders/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: `${config.serviceName} API Docs`,
    }));
    
    // API routes
    this.app.use(`/api/${config.apiVersion}/orders`, orderRoutes);

    // Duplicate for backwards compatibility
    this.app.get('/api/v1/orders/docs/swagger.json', (_req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    this.app.use('/api/v1/orders/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: `${config.serviceName} API Docs`,
    }));

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl,
      });
    });
  }

  private generateSwaggerJson(): void {
    const docsDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    const swaggerPath = path.join(docsDir, 'swagger.json');
    fs.writeFileSync(swaggerPath, JSON.stringify(swaggerSpec, null, 2));
    logger.info(`Swagger documentation generated at ${swaggerPath}`);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }
}

export default new App().app;
