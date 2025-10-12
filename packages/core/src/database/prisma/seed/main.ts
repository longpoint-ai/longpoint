import { PrismaClient } from '../../generated/prisma';
import { createDefaultRoles } from './default-roles.seed';

const prisma = new PrismaClient();

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
