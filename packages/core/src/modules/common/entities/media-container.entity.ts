import {
  MediaContainerStatus,
  MediaType,
  Prisma,
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
import { MediaContainerParams } from '../dtos/media';
import { PrismaService } from '../services/prisma/prisma.service';
import { StorageUnitEntity } from './storage-unit.entity';

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

  async update(data: Omit<Prisma.MediaContainerUpdateInput, 'id'>) {
    const updated = await this.prismaService.mediaContainer.update({
      where: { id: this.id },
      data,
      select: selectMediaContainer(),
    });
    this._name = updated.name;
    this._path = updated.path;
    this._type = updated.type;
    this._status = updated.status as MediaContainerStatus;
    this._createdAt = updated.createdAt;
    this.assets = updated.assets as SelectedMediaContainer['assets'];
  }

  /**
   * Deletes the media container.
   * @param permanently Whether to permanently delete the media container.
   */
  async delete(permanently = false): Promise<void> {
    if (permanently) {
      await this.prismaService.mediaContainer.delete({
        where: { id: this.id },
      });
      await this.storageUnit.provider.deleteDirectory(this.path);
      return;
    }

    if (this.status === 'DELETED') {
      throw new Error('Media container is already deleted');
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
  }

  async serialize(): Promise<MediaContainerParams> {
    return {
      id: this.id,
      name: this.name,
      path: this.path,
      type: this.type,
      status: this.status,
      createdAt: this.createdAt,
      assets: await Promise.all(
        this.assets.map((asset) => this.hydrateAsset(asset))
      ),
    };
  }

  private async hydrateAsset(asset: SelectedMediaContainer['assets'][number]) {
    // Assumes primary as the only variant for now
    const assetPath = getMediaContainerPath(this.id, {
      storageUnitId: this.storageUnit.id,
      suffix: `primary.${mimeTypeToExtension(
        asset.mimeType as SupportedMimeType
      )}`,
    });

    const { url } = await this.storageUnit.provider.createSignedUrl({
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
