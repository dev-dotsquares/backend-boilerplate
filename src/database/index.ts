import { config } from '@/config';
import { connectPrisma, disconnectPrisma } from '@/infrastructure/persistence/prisma/prisma.client';
import {
  connectMongoose,
  disconnectMongoose,
} from '@/infrastructure/persistence/mongoose/mongoose.client';
import { logger } from '@/logger';

export const connectDatabase = async (): Promise<void> => {
  const provider = config.database.use;
  logger.info(`Connecting to database using provider: ${provider}`);

  switch (provider) {
    case 'postgres':
    case 'mysql':
      await connectPrisma();
      break;
    case 'mongo':
      await connectMongoose();
      break;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  const provider = config.database.use;
  logger.info('Disconnecting from database...');

  switch (provider) {
    case 'postgres':
    case 'mysql':
      await disconnectPrisma();
      break;
    case 'mongo':
      await disconnectMongoose();
      break;
  }
};
