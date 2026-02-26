import { HttpStatus } from '@/constants/http';
import { BaseError } from './base.error';

export class ValidationError extends BaseError {
  constructor(message = 'Validation failed', details: unknown = undefined) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, true, details);
  }
}
