import { Prisma } from '@/database';

export const selectStorageProviderConfig = () => {
  return {
    id: true,
    name: true,
    provider: true,
    config: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.StorageProviderConfigSelect;
};

export type SelectedStorageProviderConfig =
  Prisma.StorageProviderConfigGetPayload<{
    select: ReturnType<typeof selectStorageProviderConfig>;
  }>;
