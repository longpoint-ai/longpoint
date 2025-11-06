import {
  MediaAssetVariant,
  MediaContainerStatus,
  MediaType,
} from '@/database/generated/prisma';
import { SupportedMimeType } from '@longpoint/types';
import {
  getMediaContainerPath,
  mimeTypeToExtension,
} from '@longpoint/utils/media';
import {
  SelectedMediaContainer,
  selectMediaContainer,
} from '../../../shared/selectors/media.selectors';
import { PrismaService } from '../../common/services/prisma/prisma.service';
import { StorageUnitEntity } from '../../storage-unit/entities/storage-unit.entity';
import {
  MediaAssetDto,
  MediaAssetVariantsDto,
  UpdateMediaContainerDto,
} from '../dtos';
import { MediaContainerDto } from '../dtos/media-container.dto';
import {
  MediaContainerAlreadyDeleted,
  MediaContainerAlreadyExists,
  MediaContainerNotFound,
} from '../media.errors';

export interface MediaContainerEntityArgs extends SelectedMediaContainer {
  storageUnit: StorageUnitEntity;
  prismaService: PrismaService;
}

export class MediaContainerEntity {
  public readonly id: string;
  private _name: string;
  private _path: string;
  private _type: MediaType;
  private _status: MediaContainerStatus;
  private _createdAt: Date;
  private readonly storageUnit: StorageUnitEntity;
  private readonly prismaService: PrismaService;
  private assets: SelectedMediaContainer['assets'];

  constructor(args: MediaContainerEntityArgs) {
    this.id = args.id;
    this._name = args.name;
    this._path = args.path;
    this._type = args.type;
    this._status = args.status;
    this._createdAt = args.createdAt;
    this.storageUnit = args.storageUnit;
    this.prismaService = args.prismaService;
    this.assets = args.assets;
  }

  async update(data: UpdateMediaContainerDto) {
    const { name: newName, path: newPath } = data;

    if (newName || newPath) {
      const existingContainer =
        await this.prismaService.mediaContainer.findUnique({
          where: {
            path_name: {
              path: newPath ?? this.path,
              name: newName ?? this.name,
            },
          },
        });

      if (existingContainer) {
        throw new MediaContainerAlreadyExists(
          newName ?? this.name,
          newPath ?? this.path
        );
      }
    }

    try {
      const updated = await this.prismaService.mediaContainer.update({
        where: { id: this.id },
        data: {
          name: newName,
          path: newPath,
        },
        select: selectMediaContainer(),
      });

      this._name = updated.name;
      this._path = updated.path;
      this._type = updated.type;
      this._status = updated.status as MediaContainerStatus;
      this._createdAt = updated.createdAt;
      this.assets = updated.assets as SelectedMediaContainer['assets'];
    } catch (e) {
      if (PrismaService.isNotFoundError(e)) {
        throw new MediaContainerNotFound(this.id);
      }
      throw e;
    }
  }

  /**
   * Deletes the media container.
   * @param permanently Whether to permanently delete the media container.
   */
  async delete(permanently = false): Promise<void> {
    try {
      if (permanently) {
        await this.prismaService.mediaContainer.delete({
          where: { id: this.id },
        });
        const provider = await this.storageUnit.getProvider();
        // Construct the full storage path for the container
        const containerStoragePath = getMediaContainerPath(this.id, {
          storageUnitId: this.storageUnit.id,
        });
        await provider.deleteDirectory(containerStoragePath);
        return;
      }

      if (this.status === 'DELETED') {
        throw new MediaContainerAlreadyDeleted(this.id);
      }

      const updated = await this.prismaService.mediaContainer.update({
        where: { id: this.id },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
        },
        select: selectMediaContainer(),
      });

      this._status = updated.status;
    } catch (e) {
      if (PrismaService.isNotFoundError(e)) {
        throw new MediaContainerNotFound(this.id);
      }
      throw e;
    }
  }

  async toDto(): Promise<MediaContainerDto> {
    return new MediaContainerDto({
      id: this.id,
      name: this.name,
      path: this.path,
      type: this.type,
      status: this.status,
      createdAt: this.createdAt,
      variants: await this.getVariants(),
      thumbnails: await this.getThumbnailAssets(),
    });
  }

  private async getVariants() {
    return new MediaAssetVariantsDto(
      await Promise.all(
        this.assets.map(async (asset) => await this.hydrateAsset(asset))
      )
    );
  }

  private async getThumbnailAssets() {
    if (
      this.type == MediaType.IMAGE &&
      this.assets.length === 1 &&
      this.assets[0].variant === MediaAssetVariant.PRIMARY
    ) {
      return [new MediaAssetDto(await this.hydrateAsset(this.assets[0]))];
    }
    return await Promise.all(
      this.assets
        .filter((asset) => asset.variant === MediaAssetVariant.THUMBNAIL)
        .map(async (asset) => new MediaAssetDto(await this.hydrateAsset(asset)))
    );
  }

  private async hydrateAsset(asset: SelectedMediaContainer['assets'][number]) {
    // Assumes primary as the only variant for now
    const assetPath = getMediaContainerPath(this.id, {
      storageUnitId: this.storageUnit.id,
      suffix: `primary.${mimeTypeToExtension(
        asset.mimeType as SupportedMimeType
      )}`,
    });

    const provider = await this.storageUnit.getProvider();

    const { url } = await provider.createSignedUrl({
      path: assetPath,
      action: 'read',
    });

    return {
      ...asset,
      url,
    };
  }

  get name() {
    return this._name;
  }

  get path() {
    return this._path;
  }

  get type() {
    return this._type;
  }

  get status() {
    return this._status;
  }

  get createdAt() {
    return this._createdAt;
  }
}
