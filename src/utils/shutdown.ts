import type { Server } from 'http';
import { logger } from '@/logger';

const SHUTDOWN_TIMEOUT_MS = 10_000;

/**
 * Registers SIGTERM/SIGINT handlers for graceful shutdown.
 * Closes the HTTP server, runs cleanup (DB disconnect), and force-exits after timeout.
 */
export const gracefulShutdown = (server: Server, cleanup: () => Promise<void>): void => {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    const forceExit = setTimeout(() => {
      logger.error('Forcefully shutting down after timeout');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    try {
      server.close(() => {
        logger.info('HTTP server closed');
      });

      await cleanup();
      logger.info('Cleanup completed. Exiting.');
      clearTimeout(forceExit);
      process.exit(0);
    } catch (error) {
      logger.error({ error }, 'Error during shutdown');
      clearTimeout(forceExit);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
};
