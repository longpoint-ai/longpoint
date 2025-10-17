import { MediaAssetVariant } from '@/database';
import { SupportedMimeType } from '@longpoint/types';
import {
  getMediaContainerPath,
  mimeTypeToExtension,
} from '@longpoint/utils/media';
import { Injectable } from '@nestjs/common';
import { MediaAssetParams } from '../../dtos/media';
import { SelectedMediaContainer } from '../../selectors/media.selectors';
import { StorageService } from '../storage/storage.service';

type HydratableMediaContainer = Pick<SelectedMediaContainer, 'id' | 'assets'>;
type HydratedMediaContainer<T extends HydratableMediaContainer> = T & {
  assets: MediaAssetParams[];
};

@Injectable()
export class CommonMediaService {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Hydrates one or more media containers with dynamic information, such as the URLs of assets.
   * @param containers The media container(s) to hydrate.
   * @returns The hydrated media container(s).
   */
  async hydrateContainer<T extends HydratableMediaContainer>(
    containers: T | T[]
  ): Promise<HydratedMediaContainer<T>[]> {
    const containerArray: T[] = Array.isArray(containers)
      ? containers
      : [containers];

    return Promise.all(
      containerArray.map(async (container) => {
        const provider = await this.storageService.getProviderByContainerId(
          container.id
        );

        const hydratedAssets = await Promise.all(
          container.assets.map(async (asset) => {
            let assetPath: string | undefined;

            if (asset.variant === MediaAssetVariant.ORIGINAL) {
              assetPath = getMediaContainerPath(container.id, {
                suffix: `original.${mimeTypeToExtension(
                  asset.mimeType as SupportedMimeType
                )}`,
              });
            }

            if (!assetPath) {
              return asset;
            }

            const { url } = await provider.createSignedUrl({
              path: assetPath,
              action: 'read',
            });

            return {
              ...asset,
              url,
            };
          })
        );

        return {
          ...container,
          assets: hydratedAssets,
        };
      })
    );
  }
}
