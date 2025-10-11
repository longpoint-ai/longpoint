import { z } from 'zod';
import { loadEnvFiles } from './env.loader';

loadEnvFiles();

const envSchema = z.object({
  AUTH_SECRET: z.string(),
  PORT: z.string().transform(Number).default(3000),
  NODE_ENV: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(['development', 'production']))
    .default('development'),
  BASE_URL: z.string(),
  LOG_LEVEL: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(['debug', 'info', 'warn', 'error']))
    .default('debug'),

  // Database
  DATABASE_URL: z.string().optional(),

  // Async task
  // ASYNC_TASK_SECRET: z.string(),
  // ASYNC_TASK_DEFAULT_QUEUE: z.string().default("default"),

  // CDN
  // CDN_ENABLED: z.enum(["true", "false"]).default("false"),
  // CDN_SIGNING_KEY_NAME: z.string(),
  // CDN_SIGNING_KEY: z.string().optional(),
  // CDN_DOMAIN: z.string().optional(),

  // CORS
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:4200')
    .transform((origins) => origins.split(',').map((o) => o.trim()))
    .refine(
      (originList) => {
        for (const origin of originList) {
          if (origin === '*') {
            return false;
          }

          try {
            new URL(origin);
          } catch (e) {
            return false;
          }
        }

        return true;
      },
      {
        message:
          'CORS_ORIGINS must be a comma-separated list of valid URLs. Wildcard (*) is not allowed.',
      }
    ),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }

  return parsed.data;
}

export const createConfig = (env: Env) =>
  ({
    authSecret: env.AUTH_SECRET,
    baseUrl: env.BASE_URL,
    corsOrigins: env.CORS_ORIGINS,
    databaseUrl: env.DATABASE_URL,
    logLevel: env.LOG_LEVEL,
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
  } as const);

export type Config = ReturnType<typeof createConfig>;
