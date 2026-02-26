import { Prisma } from '@prisma/client';
import { config } from '@/config';
import { getPrismaClient } from '@/infrastructure/persistence/prisma/prisma.client';
import mongoose from 'mongoose';

const PING_TIMEOUT_MS = 5000;

/**
 * Pings the configured database to verify connectivity.
 * Used by the readiness probe (e.g. GET /health/ready).
 */
export async function checkDatabase(): Promise<boolean> {
  const provider = config.database.use;

  try {
    if (provider === 'mongo') {
      if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        return false;
      }
      await Promise.race([
        mongoose.connection.db.admin().ping(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('MongoDB ping timeout')), PING_TIMEOUT_MS),
        ),
      ]);
      return true;
    }

    const prisma = getPrismaClient();
    await Promise.race([
      prisma.$queryRaw(Prisma.sql`SELECT 1`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database ping timeout')), PING_TIMEOUT_MS),
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}
