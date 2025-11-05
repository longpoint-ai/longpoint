import { PrismaService } from '@/modules/common/services';
import { MediaContainerNotFound } from '@/modules/media';
import { StorageProvider, StorageUnitService } from '@/modules/storage-unit';
import {
  getContentType,
  getMediaContainerPath,
  getMimeType,
} from '@longpoint/utils/media';
import { Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import type {
  TransformParams,
  TransformParamsDto,
} from '../dtos/transform-params.dto';
import { FileNotFound, InvalidFilePath } from '../storage.errors';
import { ImageTransformService } from './image-transform.service';

@Injectable()
export class FileDeliveryService {
  constructor(
    private readonly storageUnitService: StorageUnitService,
    private readonly imageTransformService: ImageTransformService,
    private readonly prismaService: PrismaService
  ) {}

  async serveFile(req: Request, res: Response, query: TransformParamsDto) {
    const requestPath = req.path.replace(/^\/storage\/?/, '');

    const pathParts = requestPath.split('/');
    // Path format: {storageUnitId}/{containerId}/{filename}
    if (pathParts.length < 3) {
      throw new InvalidFilePath(requestPath);
    }

    const storageUnitId = pathParts[0];
    const containerId = pathParts[1];
    const filename = pathParts.slice(2).join('/');

    const storageUnit = await this.storageUnitService.getStorageUnitById(
      storageUnitId
    );

    const originalPath = requestPath;

    const hasTransformParams = query.w !== undefined || query.h !== undefined;

    if (!hasTransformParams) {
      try {
        const buffer = await storageUnit.provider.getFileContents(originalPath);

        const contentType = getContentType(filename);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.send(buffer);
        return;
      } catch (error) {
        throw new FileNotFound(originalPath);
      }
    }

    try {
      const recipeHash = this.generateCacheHash(filename, {
        w: query.w,
        h: query.h,
      });
      const outputExt = 'webp';

      // Get storage unit ID from container
      // Note: Using findUnique with raw query since Prisma types need regeneration
      const container = await this.prismaService.mediaContainer.findUnique({
        where: {
          id: containerId,
        },
        select: {
          storageUnitId: true,
        },
      });

      if (!container) {
        throw new MediaContainerNotFound(containerId);
      }

      const cachePath = await this.getCachePath(
        containerId,
        container.storageUnitId,
        recipeHash,
        outputExt
      );

      const cacheExists = await this.checkCacheExists(
        storageUnit.provider,
        cachePath
      );

      if (cacheExists) {
        const cachedBuffer = await this.readCache(
          storageUnit.provider,
          cachePath
        );
        res.setHeader('Content-Type', getMimeType(outputExt));
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.send(cachedBuffer);
        return;
      }

      const originalBuffer = await storageUnit.provider.getFileContents(
        originalPath
      );
      const transformResult = await this.imageTransformService.transform(
        originalBuffer,
        {
          width: query.w,
          height: query.h,
        }
      );

      await this.writeCache(
        storageUnit.provider,
        cachePath,
        transformResult.buffer
      );

      res.setHeader('Content-Type', transformResult.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(transformResult.buffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // If transformation fails, try to serve original
      try {
        const buffer = await storageUnit.provider.getFileContents(originalPath);
        const contentType = getContentType(filename);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.send(buffer);
      } catch {
        throw new FileNotFound(originalPath);
      }
    }
  }

  private normalizeTransformParams(params: TransformParams) {
    const entries: string[] = [];

    if (params.w !== undefined) {
      entries.push(`w:${params.w}`);
    }
    if (params.h !== undefined) {
      entries.push(`h:${params.h}`);
    }

    entries.sort();

    return entries.join(',');
  }

  private generateCacheHash(fileName: string, params: TransformParams) {
    const normalized = this.normalizeTransformParams(params);
    const hash = crypto
      .createHash('sha256')
      .update(`${fileName}-${normalized}`)
      .digest('hex');
    return hash.substring(0, 16);
  }

  private async getCachePath(
    containerId: string,
    storageUnitId: string,
    recipeHash: string,
    ext: string
  ) {
    return getMediaContainerPath(containerId, {
      storageUnitId,
      suffix: `.cache/${recipeHash}.${ext}`,
    });
  }

  private checkCacheExists(provider: StorageProvider, cachePath: string) {
    return provider.exists(cachePath);
  }

  private readCache(provider: StorageProvider, cachePath: string) {
    return provider.getFileContents(cachePath);
  }

  private writeCache(
    provider: StorageProvider,
    cachePath: string,
    buffer: Buffer
  ) {
    return provider.upload(cachePath, buffer);
  }
}
