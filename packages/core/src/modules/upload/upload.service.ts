import {
  MediaAsset,
  MediaAssetStatus,
  MediaContainerStatus,
  Prisma,
} from '@/database';
import { ClassifierService } from '@/modules/classifier/classifier.service';
import { ConfigService, PrismaService } from '@/modules/common/services';
import { StorageUnitService } from '@/modules/storage-unit';
import type { StorageProvider } from '@longpoint/devkit';
import { SupportedMimeType } from '@longpoint/types';
import {
  getMediaContainerPath,
  mimeTypeToExtension,
  mimeTypeToMediaType,
} from '@longpoint/utils/media';
import { Injectable } from '@nestjs/common';
import { isAfter } from 'date-fns';
import { Request } from 'express';
import { MediaProbeService } from '../common/services/media-probe/media-probe.service';
import { EventPublisher } from '../event';
import { UrlSigningService } from '../storage/services/url-signing.service';
import { UploadAssetQueryDto } from './dtos/upload-asset.dto';
import { TokenExpired } from './upload.errors';

@Injectable()
export class UploadService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageUnitService: StorageUnitService,
    private readonly probeService: MediaProbeService,
    private readonly classifierService: ClassifierService,
    private readonly configService: ConfigService,
    private readonly urlSigningService: UrlSigningService,
    private readonly eventPublisher: EventPublisher
  ) {}

  async upload(containerId: string, query: UploadAssetQueryDto, req: Request) {
    const uploadToken = await this.prismaService.uploadToken.findUnique({
      where: {
        token: query.token,
      },
      select: {
        expiresAt: true,
        mediaAsset: {
          select: {
            id: true,
            containerId: true,
            mimeType: true,
            classifiersOnUpload: true,
            container: {
              select: {
                storageUnitId: true,
              },
            },
          },
        },
      },
    });

    if (!uploadToken || isAfter(new Date(), uploadToken.expiresAt)) {
      throw new TokenExpired();
    }

    const storageUnit =
      await this.storageUnitService.getStorageUnitByContainerId(containerId);

    await this.updateAsset(uploadToken.mediaAsset.id, {
      status: 'PROCESSING',
    });

    const extension = mimeTypeToExtension(
      uploadToken.mediaAsset.mimeType as SupportedMimeType
    );
    const fullPath = getMediaContainerPath(containerId, {
      storageUnitId: uploadToken.mediaAsset.container.storageUnitId,
      prefix: this.configService.get('storage.pathPrefix'),
      suffix: `primary.${extension}`,
    });

    try {
      const provider = await storageUnit.getProvider();
      await provider.upload(fullPath, req);
      await this.finalize(fullPath, provider, uploadToken.mediaAsset);
    } catch (error) {
      await this.updateAsset(uploadToken.mediaAsset.id, {
        status: 'FAILED',
      });
      throw error;
    }

    this.runClassifiers(uploadToken.mediaAsset);
  }

  private async finalize(
    fullPath: string,
    provider: StorageProvider,
    asset: Pick<MediaAsset, 'id' | 'containerId' | 'mimeType'>
  ) {
    try {
      // Extract filename from fullPath (format: {prefix}/{storageUnitId}/{containerId}/primary.{extension})
      const pathParts = fullPath.split('/');
      const filename = pathParts[pathParts.length - 1];
      const url = this.urlSigningService.generateSignedUrl(
        asset.containerId,
        filename
      );
      const baseUrl = this.configService.get('server.baseUrl');
      const fullUrl = new URL(url, baseUrl).href;

      const mediaType = mimeTypeToMediaType(asset.mimeType);
      let assetUpdateData: Prisma.MediaAssetUpdateInput = {};

      if (mediaType === 'IMAGE') {
        const imageProbe = await this.probeService.probeImage(fullUrl);
        assetUpdateData = {
          width: imageProbe.width,
          height: imageProbe.height,
          aspectRatio: imageProbe.aspectRatio,
          size: imageProbe.size.bytes,
        };
      }

      await this.updateAsset(asset.id, {
        ...assetUpdateData,
        status: 'READY',
        uploadToken: {
          delete: true,
        },
      });
      await this.eventPublisher.publish('media.asset.ready', {
        id: asset.id,
        containerId: asset.containerId,
      });
    } catch (e) {
      await this.updateAsset(asset.id, {
        status: 'FAILED',
      });
      await this.eventPublisher.publish('media.asset.failed', {
        id: asset.id,
        containerId: asset.containerId,
      });
      throw e;
    }
  }

  /**
   * Updates an asset and syncs the container status
   * @param assetId
   * @param data
   */
  private async updateAsset(
    assetId: string,
    data: Prisma.MediaAssetUpdateInput
  ) {
    await this.prismaService.$transaction(async (tx) => {
      const updatedAsset = await tx.mediaAsset.update({
        where: {
          id: assetId,
        },
        data,
        select: {
          containerId: true,
        },
      });

      const allAssetsForContainer = await tx.mediaAsset.findMany({
        where: {
          containerId: updatedAsset.containerId,
        },
        select: {
          status: true,
        },
      });

      const statusBreakdown = Object.values(MediaAssetStatus).reduce(
        (acc, status) => {
          acc[status] = 0;
          return acc;
        },
        {} as Record<MediaAssetStatus, number>
      );

      for (const asset of allAssetsForContainer) {
        statusBreakdown[asset.status]++;
      }

      let containerStatus: MediaContainerStatus = 'PROCESSING';

      const fullyReady =
        statusBreakdown['PROCESSING'] === 0 &&
        statusBreakdown['READY'] > 0 &&
        statusBreakdown['FAILED'] === 0;
      const completeFailure =
        statusBreakdown['PROCESSING'] === 0 &&
        statusBreakdown['READY'] === 0 &&
        statusBreakdown['FAILED'] > 0;
      const partialFailure =
        statusBreakdown['PROCESSING'] === 0 &&
        statusBreakdown['READY'] > 0 &&
        statusBreakdown['FAILED'] > 0;

      if (fullyReady) {
        containerStatus = 'READY';
      } else if (completeFailure) {
        containerStatus = 'FAILED';
      } else if (partialFailure) {
        containerStatus = 'PARTIALLY_FAILED';
      }

      await tx.mediaContainer.update({
        where: {
          id: updatedAsset.containerId,
        },
        data: {
          status: containerStatus,
        },
      });
    });
  }

  /**
   * Run any classifiers that are configured to run on the uploaded asset
   * @param asset
   */
  private async runClassifiers(
    asset: Pick<MediaAsset, 'id' | 'classifiersOnUpload'>
  ) {
    if (asset.classifiersOnUpload.length === 0) {
      return;
    }

    const classifiers = await this.classifierService.listClassifiers();
    const entities = classifiers.filter((classifier) =>
      asset.classifiersOnUpload.includes(classifier.name)
    );

    await Promise.all(entities.map((entity) => entity.run(asset.id)));
  }
}
