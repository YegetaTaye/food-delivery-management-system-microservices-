import app from './app';
import { config } from './config/env';
import logger from './utils/logger';
import { connectDatabase } from './config/database';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      logger.info(`🚀 ${config.serviceName} running on port ${config.port}`);
      logger.info(`📚 Docs: http://localhost:${config.port}/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
