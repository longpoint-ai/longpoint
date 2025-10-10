import { config as dotenvConfig } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

/**
 * Loads environment files in the following order:
 * 1. .env.{NODE_ENV}.local (local overrides, git-ignored)
 * 2. .env.{NODE_ENV}
 * 3. .env.local (local overrides, git-ignored)
 * 4. .env (base defaults)
 */
export function loadEnvFiles() {
  const nodeEnv = process.env["NODE_ENV"] || "development";
  const envFiles = [
    `.env.${nodeEnv}.local`,
    `.env.${nodeEnv}`,
    ".env.local",
    ".env",
  ];

  const envPaths = envFiles.map((file) => resolve(process.cwd(), file));

  // Load each existing env file in reverse order (so earlier files take precedence)
  envPaths
    .filter((path) => existsSync(path))
    .reverse()
    .forEach((path) => {
      dotenvConfig({ path });
    });
}
