import {
  MediaAsset,
  MediaAssetStatus,
  MediaContainerStatus,
  Prisma,
} from '@/database';
import { StorageProviderFactory } from '@/server/common/factories';
import {
  CommonClassifierService,
  PrismaService,
} from '@/server/common/services';
import { StorageProvider } from '@/server/common/types/storage-provider.types';
import { SupportedMimeType } from '@longpoint/types';
import {
  getMediaContainerPath,
  mimeTypeToExtension,
  mimeTypeToMediaType,
} from '@longpoint/utils/media';
import { Injectable } from '@nestjs/common';
import { isAfter } from 'date-fns';
import { Request } from 'express';
import { ProbeService } from '../../services/probe.service';
import { UploadAssetQueryDto } from './dtos/upload-asset.dto';
import { TokenExpired } from './upload.errors';

@Injectable()
export class UploadService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageProviderFactory: StorageProviderFactory,
    private readonly probeService: ProbeService,
    private readonly commonClassifierService: CommonClassifierService
  ) {}

  async upload(containerId: string, query: UploadAssetQueryDto, req: Request) {
    const storageProvider =
      await this.storageProviderFactory.getDefaultProvider();
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
          },
        },
      },
    });

    if (!uploadToken || isAfter(new Date(), uploadToken.expiresAt)) {
      throw new TokenExpired();
    }

    await this.updateAsset(uploadToken.mediaAsset.id, {
      status: 'PROCESSING',
    });

    const extension = mimeTypeToExtension(
      uploadToken.mediaAsset.mimeType as SupportedMimeType
    );
    const fullPath = getMediaContainerPath(containerId, {
      suffix: `primary.${extension}`,
    });

    try {
      await storageProvider.upload(fullPath, req);
      await this.finalize(fullPath, storageProvider, uploadToken.mediaAsset);
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
    storageProvider: StorageProvider,
    asset: Pick<MediaAsset, 'id' | 'containerId' | 'mimeType'>
  ) {
    try {
      const { url } = await storageProvider.createSignedUrl({
        path: fullPath,
        action: 'read',
      });

      const mediaType = mimeTypeToMediaType(asset.mimeType);
      let assetUpdateData: Prisma.MediaAssetUpdateInput = {};

      if (mediaType === 'IMAGE') {
        const imageProbe = await this.probeService.probeImage(url);
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
    } catch (e) {
      await this.updateAsset(asset.id, {
        status: 'FAILED',
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
    await Promise.all(
      asset.classifiersOnUpload.map((classifierName) =>
        this.commonClassifierService.runClassifier(asset.id, classifierName)
      )
    );
  }
}
