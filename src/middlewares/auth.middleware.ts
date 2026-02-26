import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { AuthError } from '@/exceptions';

/**
 * Verifies the Bearer token from the Authorization header.
 * Attaches decoded payload to req.user on success.
 * Completely independent -- apply to any route that requires authentication.
 */
export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid authorization header');
  }

  const token = header.slice(7);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    throw new AuthError('Invalid or expired access token');
  }
};
