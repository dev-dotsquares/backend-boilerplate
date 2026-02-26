import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),

    DATABASE_USE: z.enum(['mongo', 'postgres', 'mysql']).default('mysql'),
    DATABASE_URL: z.string().min(1).optional(),
    MONGO_URI: z.string().min(1).optional(),

    JWT_SECRET: z.string().min(16).default('change-me-to-a-secure-random-secret-key'),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().min(16).default('change-me-to-another-secure-random-key'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    CORS_ORIGINS: z.string().default('*'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    JSON_BODY_LIMIT: z.string().default('10kb'),
    REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),

    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    LOG_DIR: z.string().default('./logs'),

    SWAGGER_ENABLED: z
      .string()
      .default('false')
      .transform((val) => val === 'true'),
  })
  .superRefine((data, ctx) => {
    if ((data.DATABASE_USE === 'postgres' || data.DATABASE_USE === 'mysql') && !data.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `DATABASE_URL is required when DATABASE_USE=${data.DATABASE_USE}`,
        path: ['DATABASE_URL'],
      });
    }
    if (data.DATABASE_USE === 'mongo' && !data.MONGO_URI) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'MONGO_URI is required when DATABASE_USE=mongo',
        path: ['MONGO_URI'],
      });
    }
  });

export type EnvConfig = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
