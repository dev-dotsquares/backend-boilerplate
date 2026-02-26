import mongoose from 'mongoose';
import { config } from '@/config';
import { logger } from '@/logger';

export const connectMongoose = async (): Promise<void> => {
  const uri = config.database.mongoUri;
  if (!uri) {
    throw new Error('MONGO_URI is not configured');
  }

  await mongoose.connect(uri);
  logger.info('Mongoose connected to MongoDB');
};

export const disconnectMongoose = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('Mongoose disconnected from MongoDB');
};
