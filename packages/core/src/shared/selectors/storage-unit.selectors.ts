import { Prisma } from '@/database';

export const selectStorageUnit = () => {
  return {
    id: true,
    name: true,
    isDefault: true,
    storageProviderConfigId: true,
    storageProviderConfig: {
      select: {
        id: true,
        name: true,
        provider: true,
        config: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.StorageUnitSelect;
};

export type SelectedStorageUnit = Prisma.StorageUnitGetPayload<{
  select: ReturnType<typeof selectStorageUnit>;
}>;
