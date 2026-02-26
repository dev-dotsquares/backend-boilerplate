import type { Request, Response, NextFunction } from 'express';
import { config } from '@/config';
import { HttpStatus } from '@/constants/http';

/**
 * Aborts the request with 408 if it exceeds the configured timeout.
 * Independent middleware -- remove from app.ts to disable.
 */
export const timeoutMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const timeoutMs = config.security.requestTimeoutMs;

  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(HttpStatus.REQUEST_TIMEOUT).json({
        success: false,
        message: 'Request timeout',
        meta: { requestId: req.requestId },
      });
    }
  }, timeoutMs);

  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));

  next();
};
