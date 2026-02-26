import { env } from './env';

export const config = {
  app: {
    port: env.PORT,
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
  },
  database: {
    use: env.DATABASE_USE,
    url: env.DATABASE_URL,
    mongoUri: env.MONGO_URI,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  security: {
    corsOrigins: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: env.RATE_LIMIT_MAX,
    jsonBodyLimit: env.JSON_BODY_LIMIT,
    requestTimeoutMs: env.REQUEST_TIMEOUT_MS,
  },
  logger: {
    level: env.LOG_LEVEL,
    dir: env.LOG_DIR,
  },
  swagger: {
    enabled: env.SWAGGER_ENABLED,
  },
};

export type AppConfig = typeof config;
