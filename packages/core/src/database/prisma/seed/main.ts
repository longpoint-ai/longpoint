import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import pg from 'pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { createDefaultRoles } from './default-roles.seed';

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await createDefaultRoles(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
