import type { Request, Response, NextFunction } from 'express';
import { BaseError } from '@/exceptions';
import { HttpStatus } from '@/constants/http';

/**
 * Factory that creates a middleware checking req.user.role against allowed roles.
 * Must be used AFTER authMiddleware so that req.user is populated.
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new BaseError('Insufficient permissions', HttpStatus.FORBIDDEN, true);
    }

    next();
  };
};
