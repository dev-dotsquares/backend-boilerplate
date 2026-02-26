import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError, type ZodIssue } from 'zod';
import { ValidationError } from '@/exceptions';

interface ValidationSchemas {
  body?: ZodSchema | undefined;
  params?: ZodSchema | undefined;
  query?: ZodSchema | undefined;
}

/**
 * Validates request body, params, and/or query against Zod schemas.
 * Parsed body is written back to req.body. Parsed params/query are stored
 * on req.validated since Express 5 makes req.query read-only.
 */
export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.validated) {
        req.validated = {};
      }

      if (schemas.body) {
        const parsed = schemas.body.parse(req.body);
        req.body = parsed;
        req.validated.body = parsed;
      }
      if (schemas.params) {
        req.validated.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.validated.query = schemas.query.parse(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue: ZodIssue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        next(new ValidationError('Validation failed', details));
        return;
      }
      next(error);
    }
  };
};
