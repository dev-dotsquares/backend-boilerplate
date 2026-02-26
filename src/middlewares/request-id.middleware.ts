import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * Reads x-request-id from incoming headers or generates a new UUID.
 * Attaches it to req.requestId and echoes it back in the response header.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};
