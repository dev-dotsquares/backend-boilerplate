import type { Request, Response, NextFunction } from 'express';
import { BaseError } from '@/exceptions';
import { HttpStatus } from '@/constants/http';
import { config } from '@/config';
import { logger } from '@/logger';

/**
 * Global error handler. Differentiates operational (BaseError) from unexpected errors.
 * Stack traces and internal details are only exposed in non-production environments.
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = req.requestId;

  if (err instanceof BaseError) {
    logger.error({
      requestId,
      error: err.message,
      statusCode: err.statusCode,
      ...(config.app.isDevelopment ? { stack: err.stack } : {}),
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined ? { error: err.details } : {}),
      ...(config.app.isDevelopment ? { stack: err.stack } : {}),
      meta: { requestId },
    });
    return;
  }

  logger.error({
    requestId,
    error: err.message,
    stack: err.stack,
  });

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: config.app.isProduction ? 'Internal server error' : err.message,
    ...(config.app.isDevelopment ? { stack: err.stack } : {}),
    meta: { requestId },
  });
};
