import { PrismaClient } from '@prisma/client';
import { logger } from '@/logger';

let prisma: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }
  return prisma;
};

export const connectPrisma = async (): Promise<void> => {
  const client = getPrismaClient();
  await client.$connect();
  logger.info('Prisma connected to database');
};

export const disconnectPrisma = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
    logger.info('Prisma disconnected from database');
  }
};
