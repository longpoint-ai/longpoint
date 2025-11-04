import { SupportedMimeType } from '@longpoint/types';
import {
  getMediaContainerPath,
  mimeTypeToExtension,
} from '@longpoint/utils/media';
import { Injectable } from '@nestjs/common';
import { MediaAssetParams } from '../../dtos/media';
import { MediaContainerEntity } from '../../entities';
import { MediaContainerNotFound } from '../../errors';
import {
  SelectedMediaContainer,
  selectMediaContainer,
} from '../../selectors/media.selectors';
import { StorageProvider } from '../../types/storage-provider.types';
import { PrismaService } from '../prisma/prisma.service';
import { StorageUnitService } from '../storage-unit/storage-unit.service';

type HydratableMediaContainer = Pick<SelectedMediaContainer, 'id' | 'assets'>;
type HydratableMediaAsset = Pick<MediaAssetParams, 'mimeType'>;
type HydratedMediaAsset<T extends HydratableMediaAsset> = T & {
  url: string;
};
type HydratedMediaContainer<T extends HydratableMediaContainer> = T & {
  assets: MediaAssetParams[];
};

@Injectable()
export class CommonMediaService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageUnitService: StorageUnitService
  ) {}

  async getMediaContainerById(id: string): Promise<MediaContainerEntity> {
    const container = await this.prismaService.mediaContainer.findUnique({
      where: { id },
      select: selectMediaContainer(),
    });

    if (!container) {
      throw new MediaContainerNotFound(id);
    }

    return new MediaContainerEntity({
      ...container,
      storageUnit: await this.storageUnitService.getStorageUnitByContainerId(
        id
      ),
      prismaService: this.prismaService,
    });
  }

  /**
   * Hydrates one or more media containers with dynamic information, such as the URLs of assets.
   * @param containers The media container(s) to hydrate.
   * @returns The hydrated media container(s).
   */
  async hydrateContainers<T extends HydratableMediaContainer>(
    containers: T | T[]
  ): Promise<HydratedMediaContainer<T>[]> {
    const containerArray: T[] = Array.isArray(containers)
      ? containers
      : [containers];

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const mainThis: CommonMediaService = this;

    const results = await Promise.all(
      containerArray.map(async (container) => {
        const storageUnit =
          await this.storageUnitService.getStorageUnitByContainerId(
            container.id
          );
        const hydratedAssets = await Promise.all(
          container.assets.map(async (asset) => {
            return mainThis.hydrateAssetInternal(
              container.id,
              storageUnit.provider,
              asset
            );
          })
        );

        return {
          ...container,
          assets: hydratedAssets,
        };
      })
    );
    return results;
  }

  /**
   * Hydrates a media asset with a dynamic information, such as the URL.
   * @param mediaContainerId The ID of the media container the asset belongs to.
   * @param asset The asset to hydrate.
   * @returns The hydrated asset.
   */
  async hydrateAsset<T extends HydratableMediaAsset>(
    mediaContainerId: string,
    asset: T
  ): Promise<HydratedMediaAsset<T>> {
    const storageUnit =
      await this.storageUnitService.getStorageUnitByContainerId(
        mediaContainerId
      );
    return this.hydrateAssetInternal(
      mediaContainerId,
      storageUnit.provider,
      asset
    );
  }

  private async hydrateAssetInternal<T extends HydratableMediaAsset>(
    mediaContainerId: string,
    provider: StorageProvider,
    asset: T
  ) {
    const container = await this.prismaService.mediaContainer.findUnique({
      where: {
        id: mediaContainerId,
      },
      select: {
        storageUnitId: true,
      },
    });

    if (!container) {
      throw new MediaContainerNotFound(mediaContainerId);
    }

    // Assumes primary as the only variant for now
    const assetPath = getMediaContainerPath(mediaContainerId, {
      storageUnitId: container.storageUnitId,
      suffix: `primary.${mimeTypeToExtension(
        asset.mimeType as SupportedMimeType
      )}`,
    });

    const { url } = await provider.createSignedUrl({
      path: assetPath,
      action: 'read',
    });

    return {
      ...asset,
      url,
    };
  }
}
