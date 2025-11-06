import { Prisma } from '@/database';

export const selectStorageUnit = () => {
  return {
    id: true,
    name: true,
    provider: true,
    isDefault: true,
    config: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.StorageUnitSelect;
};

export type SelectedStorageUnit = Prisma.StorageUnitGetPayload<{
  select: ReturnType<typeof selectStorageUnit>;
}>;
