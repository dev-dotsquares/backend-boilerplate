import { z } from 'zod';

export const createUserBody = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or less'),
});

export const updateUserBody = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
});

export const idParam = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const listUsersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
