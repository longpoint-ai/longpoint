import { Prisma } from '@/database';

export const selectUser = () => {
  return {
    id: true,
    name: true,
    email: true,
    image: true,
  } satisfies Prisma.UserSelect;
};

export type SelectedUser = Prisma.UserGetPayload<{
  select: ReturnType<typeof selectUser>;
}>;
