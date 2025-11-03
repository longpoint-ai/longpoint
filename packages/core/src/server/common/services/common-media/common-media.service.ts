import { SupportedMimeType } from '@longpoint/types';
import {
  getMediaContainerPath,
  mimeTypeToExtension,
} from '@longpoint/utils/media';
import { Injectable } from '@nestjs/common';
import { MediaAssetParams } from '../../dtos/media';
import { StorageProviderFactory } from '../../factories';
import { SelectedMediaContainer } from '../../selectors/media.selectors';
import { StorageProvider } from '../../types/storage-provider.types';

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
    private readonly storageProviderFactory: StorageProviderFactory
  ) {}

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
        const provider =
          await this.storageProviderFactory.getProviderByContainerId(
            container.id
          );

        const hydratedAssets = await Promise.all(
          container.assets.map(async (asset) => {
            return mainThis.hydrateAssetInternal(container.id, provider, asset);
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
    const provider = await this.storageProviderFactory.getProviderByContainerId(
      mediaContainerId
    );
    return this.hydrateAssetInternal(mediaContainerId, provider, asset);
  }

  private async hydrateAssetInternal<T extends HydratableMediaAsset>(
    mediaContainerId: string,
    provider: StorageProvider,
    asset: T
  ) {
    // Assumes primary as the only variant for now
    const assetPath = getMediaContainerPath(mediaContainerId, {
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
