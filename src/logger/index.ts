import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { config } from '@/config';

const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'body.password',
  'body.token',
  'body.refreshToken',
  'body.accessToken',
  'body.secret',
];

const baseOptions: pino.LoggerOptions = {
  level: config.logger.level,
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

function createLogger(): pino.Logger {
  if (config.app.isDevelopment) {
    return pino({
      ...baseOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  if (config.app.isProduction) {
    const logDir = path.resolve(config.logger.dir);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const errorLogPath = path.join(logDir, 'error.log');
    const streams: pino.StreamEntry[] = [
      { level: 'info', stream: process.stdout },
      { level: 'error', stream: pino.destination(errorLogPath) },
    ];

    return pino(baseOptions, pino.multistream(streams));
  }

  return pino(baseOptions);
}

export const logger = createLogger();
