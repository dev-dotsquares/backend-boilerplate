import type { Response } from 'express';
import { HttpStatus } from '@/constants/http';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T | undefined;
  error?: unknown | undefined;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode: number = HttpStatus.OK,
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message = 'Internal server error',
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  error?: unknown,
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(error !== undefined ? { error } : {}),
  };
  res.status(statusCode).json(response);
};
