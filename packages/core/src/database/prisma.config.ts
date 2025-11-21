import 'dotenv/config';
import path from 'path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'prisma'),
  migrations: {
    path: path.join(__dirname, 'prisma', 'migrations'),
    seed: 'tsx prisma/seed/main.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
