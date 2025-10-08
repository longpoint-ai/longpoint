import { z } from "zod";
import { loadEnvFiles } from "./env.loader";

loadEnvFiles();

const envSchema = z.object({
  // Server
  PORT: z.string().transform(Number).default("3000"),
  NODE_ENV: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(["development", "production"]))
    .default("development"),
  BASE_API_URL: z.string().url(),
  LOG_LEVEL: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(["debug", "info", "warn", "error"]))
    .default("debug"),

  // Database
  DATABASE_URL: z.string().url(),

  // Async task
  // ASYNC_TASK_SECRET: z.string(),
  // ASYNC_TASK_DEFAULT_QUEUE: z.string().default("default"),

  // CDN
  // CDN_ENABLED: z.enum(["true", "false"]).default("false"),
  // CDN_SIGNING_KEY_NAME: z.string(),
  // CDN_SIGNING_KEY: z.string().optional(),
  // CDN_DOMAIN: z.string().optional(),

  // CORS
  // CORS_ORIGINS: z
  //   .string()
  //   .default("http://localhost:3000,http://localhost:3001")
  //   .refine(
  //     (origins) => {
  //       const originList = origins.split(",").map((o) => o.trim());

  //       for (const origin of originList) {
  //         if (origin === "*") {
  //           return false;
  //         }

  //         try {
  //           new URL(origin);
  //         } catch (e) {
  //           return false;
  //         }
  //       }

  //       return true;
  //     },
  //     {
  //       message:
  //         "CORS_ORIGINS must be a comma-separated list of valid URLs. Wildcard (*) is not allowed.",
  //     }
  //   ),
}) satisfies z.ZodType<any, any, NodeJS.ProcessEnv>;

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    process.exit(1);
  }

  return parsed.data;
}

export const createConfig = (env: Env) =>
  ({
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    baseApiUrl: env.BASE_API_URL,
    logLevel: env.LOG_LEVEL,
    databaseUrl: env.DATABASE_URL,
  }) as const;

export type Config = ReturnType<typeof createConfig>;
