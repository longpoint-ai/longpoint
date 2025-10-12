import { PrismaClient } from '../../generated/prisma';

export async function createDefaultRoles(prisma: PrismaClient) {
  await prisma.role.upsert({
    where: {
      name: 'Super Admin',
    },
    create: { name: 'Super Admin' },
    update: {},
  });
}
