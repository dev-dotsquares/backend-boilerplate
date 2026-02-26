import { z } from 'zod';

export const registerBody = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or less'),
});

export const loginBody = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshBody = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const logoutBody = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
