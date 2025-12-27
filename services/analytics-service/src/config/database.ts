import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

let prisma: PrismaClient | null = null;

export const initializeDatabase = async (): Promise<PrismaClient> => {
  try {
    prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });

    // Test connection
    await prisma.$connect();
    logger.info('✅ Database connection established successfully');

    return prisma;
  } catch (error) {
    logger.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

export const getPrisma = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return prisma;
};

export const closeDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
    logger.info('Database connection closed');
  }
};

