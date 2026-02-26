import { app } from '@/app';
import { config } from '@/config';
import { logger } from '@/logger';
import { connectDatabase, disconnectDatabase } from '@/database';
import { gracefulShutdown } from '@/utils/shutdown';

const start = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(config.app.port, () => {
    logger.info(`Server running on port ${config.app.port} in ${config.app.env} mode`);
    logger.info(`Health check: http://localhost:${config.app.port}/health`);
    if (config.swagger.enabled) {
      logger.info(`Swagger docs: http://localhost:${config.app.port}/docs`);
    }
  });

  gracefulShutdown(server, async () => {
    await disconnectDatabase();
  });
};

start().catch((error) => {
  logger.fatal({ error }, 'Failed to start server');
  process.exit(1);
});
