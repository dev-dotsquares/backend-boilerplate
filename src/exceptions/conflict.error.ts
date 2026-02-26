import { HttpStatus } from '@/constants/http';
import { BaseError } from './base.error';

export class ConflictError extends BaseError {
  constructor(message = 'Resource already exists') {
    super(message, HttpStatus.CONFLICT, true);
  }
}
