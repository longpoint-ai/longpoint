import {
  getContentType,
  getMediaContainerPath,
  getMimeType,
} from '@longpoint/utils/media';
import { Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import { StorageProviderFactory } from '../common/factories';
import { StorageProvider } from '../common/types/storage-provider.types';
import type {
  TransformParams,
  TransformParamsDto,
} from './dtos/transform-params.dto';
import { ImageTransformService } from './services/image-transform.service';

@Injectable()
export class StorageService {
  constructor(
    private readonly storageProviderFactory: StorageProviderFactory,
    private readonly imageTransformService: ImageTransformService
  ) {}

  async serveFile(req: Request, res: Response, query: TransformParamsDto) {
    const requestPath = req.path.replace(/^\/storage\/?/, '');

    const pathParts = requestPath.split('/');
    if (pathParts.length < 3 || pathParts[0] !== 'default') {
      throw new NotFoundException('Invalid storage path');
    }

    const containerId = pathParts[1];
    const filename = pathParts.slice(2).join('/');

    const provider = await this.storageProviderFactory.getProviderByContainerId(
      containerId
    );

    const originalPath = requestPath;

    const hasTransformParams = query.w !== undefined || query.h !== undefined;

    if (!hasTransformParams) {
      try {
        const buffer = await provider.getFileContents(originalPath);

        const contentType = getContentType(filename);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.send(buffer);
        return;
      } catch (error) {
        throw new NotFoundException('File not found');
      }
    }

    try {
      const recipeHash = this.generateCacheHash({ w: query.w, h: query.h });
      const outputExt = 'webp';
      const cachePath = this.getCachePath(containerId, recipeHash, outputExt);

      const cacheExists = await this.checkCacheExists(provider, cachePath);

      if (cacheExists) {
        const cachedBuffer = await this.readCache(provider, cachePath);
        res.setHeader('Content-Type', getMimeType(outputExt));
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.send(cachedBuffer);
        return;
      }

      const originalBuffer = await provider.getFileContents(originalPath);
      const transformResult = await this.imageTransformService.transform(
        originalBuffer,
        {
          width: query.w,
          height: query.h,
        }
      );

      await this.writeCache(provider, cachePath, transformResult.buffer);

      res.setHeader('Content-Type', transformResult.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(transformResult.buffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // If transformation fails, try to serve original
      try {
        const buffer = await provider.getFileContents(originalPath);
        const contentType = getContentType(filename);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.send(buffer);
      } catch {
        throw new NotFoundException('File not found');
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

  private generateCacheHash(params: TransformParams) {
    const normalized = this.normalizeTransformParams(params);
    const hash = crypto.createHash('sha256').update(normalized).digest('hex');
    return hash.substring(0, 16);
  }

  private getCachePath(containerId: string, recipeHash: string, ext: string) {
    return getMediaContainerPath(containerId, {
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
