import { MediaContainerStatus, MediaType } from '@/database/generated/prisma';
import { SelectedMediaContainer } from '../selectors/media.selectors';
import { PrismaService } from '../services/prisma/prisma.service';
import { StorageUnitEntity } from './storage-unit.entity';

export interface MediaContainerEntityArgs extends SelectedMediaContainer {
  storageUnit: StorageUnitEntity;
  prismaService: PrismaService;
}

export class MediaContainerEntity {
  public readonly id: string;
  public readonly name: string;
  public readonly path: string;
  public readonly type: MediaType;
  public readonly status: MediaContainerStatus;
  public readonly createdAt: Date;
  public readonly storageUnit: StorageUnitEntity;
  private readonly prismaService: PrismaService;

  constructor(args: MediaContainerEntityArgs) {
    this.id = args.id;
    this.name = args.name;
    this.path = args.path;
    this.type = args.type;
    this.status = args.status;
    this.createdAt = args.createdAt;
    this.storageUnit = args.storageUnit;
    this.prismaService = args.prismaService;
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

    await this.prismaService.mediaContainer.update({
      where: { id: this.id },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });
  }
}
