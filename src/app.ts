import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from '@/config';
import { swaggerSpec } from '@/config/swagger';
import { apiRoutes } from '@/routes';
import { requestIdMiddleware } from '@/middlewares/request-id.middleware';
import { timeoutMiddleware } from '@/middlewares/timeout.middleware';
import { applySecurityMiddleware } from '@/middlewares/security.middleware';
import { requestLogger } from '@/logger/request-logger';
import { errorMiddleware } from '@/middlewares/error.middleware';
import { notFoundMiddleware } from '@/middlewares/notfound.middleware';
import { sendSuccess } from '@/utils/response';
import { asyncHandler } from '@/utils/async-handler';
import { checkDatabase } from '@/services/health.service';
import { HttpStatus } from '@/constants/http';

const app = express();

app.use(requestIdMiddleware);
app.use(timeoutMiddleware);

applySecurityMiddleware(app);

app.use(requestLogger);

app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok', uptime: process.uptime() }, 'Service is healthy');
});

app.get(
  '/health/ready',
  asyncHandler(async (_req, res) => {
    const dbOk = await checkDatabase();
    if (!dbOk) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Service not ready',
        data: { status: 'not ready', database: 'unavailable' },
      });
      return;
    }
    sendSuccess(res, { status: 'ready', database: 'ok' }, 'Service is ready');
  }),
);

if (config.swagger.enabled) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use('/api', apiRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export { app };
