import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

class PrismaService {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: ['error', 'warn'],
      });

      // Handle connection errors
      PrismaService.instance.$connect()
        .then(() => {
          logger.info('✅ Prisma connected to database');
        })
        .catch((error) => {
          logger.error('❌ Prisma connection failed:', error);
          process.exit(1);
        });

      // Graceful shutdown
      process.on('beforeExit', async () => {
        await PrismaService.instance.$disconnect();
        logger.info('Prisma disconnected');
      });
    }

    return PrismaService.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
      logger.info('Prisma disconnected');
    }
  }
}

export const prisma = PrismaService.getInstance();
export default PrismaService;
