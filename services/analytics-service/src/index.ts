import app from './app';
import { config } from './config/env';
import { initializeDatabase, closeDatabase } from './config/database';
import { initializeRabbitMQ, closeRabbitMQ } from './config/rabbitmq';
import { startEventConsumer } from './messaging/rabbitmq.consumer';
import logger from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    logger.info('Initializing database connection...');
    await initializeDatabase();

    // Initialize RabbitMQ connection
    logger.info('Initializing RabbitMQ connection...');
    await initializeRabbitMQ();

    // Start event consumer
    logger.info('Starting event consumer...');
    await startEventConsumer();

    // Start Express server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 ${config.serviceName} is running on port ${config.port}`);
      logger.info(
        `📚 API Documentation available at http://localhost:${config.port}/docs`
      );
      logger.info(
        `💚 Health check available at http://localhost:${config.port}/health`
      );
      logger.info(
        `📊 Analytics API available at http://localhost:${config.port}/analytics`
      );
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close RabbitMQ connection
          await closeRabbitMQ();

          // Close database connection
          await closeDatabase();

          logger.info('All connections closed. Exiting process.');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
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
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Rejection:', reason);
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
