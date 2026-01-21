import app from './app';
import { config } from './config/env';
import logger from './utils/logger';
import { PrismaClient } from '@prisma/client';
import rabbitmqService from './services/rabbitmq.service';
import { startEventConsumer } from './events/consumer';

const prisma = new PrismaClient();

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('✅ Prisma connected to database');

    // Connect to RabbitMQ
    await rabbitmqService.connect();
    
    // Start event consumer
    await startEventConsumer();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 ${config.serviceName} is running on port ${config.port}`);
      logger.info(`📚 API Documentation available at http://localhost:${config.port}/docs`);
      logger.info(`💚 Health check available at http://localhost:${config.port}/health`);
      logger.info(`🐰 RabbitMQ consumer listening for payment and delivery events`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Disconnect from RabbitMQ
      await rabbitmqService.disconnect();
      
      // Disconnect from database
      await prisma.$disconnect();
      
      server.close(() => {
        logger.info('Server closed. Exiting process.');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection:', reason);
      gracefulShutdown('unhandledRejection');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
