import path from 'path';
import type { PrismaConfig } from 'prisma';

export default {
  schema: path.join('prisma'),
  migrations: {
    seed: 'ts-node prisma/seed/main.ts --transpile-only',
  },
} satisfies PrismaConfig;
