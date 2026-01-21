import app from './app';
import { config } from './config/env';
import { connectRabbitMQ, closeRabbitMQ } from './config/rabbitmq';
import { startEventConsumer } from './events/consumer';
import logger from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();
    
    // Start event consumer
    await startEventConsumer();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 ${config.serviceName} is running on port ${config.port}`);
      logger.info(`📚 API Documentation available at http://localhost:${config.port}/docs`);
      logger.info(`💚 Health check available at http://localhost:${config.port}/health`);
      logger.info(`🐰 RabbitMQ consumer listening for order.created events`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Close RabbitMQ connection
      await closeRabbitMQ();
      
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
      throw reason;
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
