import type { Request, Response } from 'express';
import { HttpStatus } from '@/constants/http';

export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    meta: { requestId: req.requestId },
  });
};
