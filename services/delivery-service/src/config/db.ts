import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test connection
    await prisma.$connect();
    logger.info('✅ Prisma connected to database');
  } catch (error) {
    logger.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database:', error);
  }
};

export { prisma };
