import type { Application } from 'express';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import compression from 'compression';
import { config } from '@/config';

/**
 * Applies the full security middleware stack to the Express application.
 * Helmet, CORS, rate limiting, HPP, compression, and body parsers.
 */
export const applySecurityMiddleware = (app: Application): void => {
  app.disable('x-powered-by');

  app.use(helmet());

  app.use(
    cors({
      origin: config.security.corsOrigins,
      credentials: true,
    }),
  );

  app.use(
    rateLimit({
      windowMs: config.security.rateLimitWindowMs,
      max: config.security.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests, please try again later' },
    }),
  );

  app.use(hpp());
  app.use(compression());
  app.use(json({ limit: config.security.jsonBodyLimit }));
  app.use(urlencoded({ extended: true, limit: config.security.jsonBodyLimit }));
};
