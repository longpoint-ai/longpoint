import { Prisma } from '@/database';

export const selectMediaContainer = () => {
  return {
    id: true,
    name: true,
    type: true,
    status: true,
    createdAt: true,
  } satisfies Prisma.MediaContainerSelect;
};

export type SelectedMediaContainer = Prisma.MediaContainerGetPayload<{
  select: ReturnType<typeof selectMediaContainer>;
}>;
