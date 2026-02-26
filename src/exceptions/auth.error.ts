import { HttpStatus } from '@/constants/http';
import { BaseError } from './base.error';

export class AuthError extends BaseError {
  constructor(message = 'Authentication failed') {
    super(message, HttpStatus.UNAUTHORIZED, true);
  }
}
