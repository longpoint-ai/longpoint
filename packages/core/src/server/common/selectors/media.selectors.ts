import { Prisma } from '@/database';

export const selectMediaContainer = () => {
  return {
    id: true,
    name: true,
    type: true,
    status: true,
    path: true,
    createdAt: true,
    assets: {
      select: selectMediaAsset(),
    },
  } satisfies Prisma.MediaContainerSelect;
};

export type SelectedMediaContainer = Prisma.MediaContainerGetPayload<{
  select: ReturnType<typeof selectMediaContainer>;
}>;

export const selectMediaAsset = () => {
  return {
    id: true,
    variant: true,
    status: true,
    mimeType: true,
    width: true,
    height: true,
    size: true,
    aspectRatio: true,
  } satisfies Prisma.MediaAssetSelect;
};

export type SelectedMediaAsset = Prisma.MediaAssetGetPayload<{
  select: ReturnType<typeof selectMediaAsset>;
}>;
