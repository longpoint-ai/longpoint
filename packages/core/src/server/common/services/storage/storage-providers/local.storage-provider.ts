import { getMediaContainerPath } from '@longpoint/utils/media';
import { addSeconds } from 'date-fns';
import fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import {
  CreateSignedUrlOptions,
  SignedUrlResponse,
  StorageProvider,
} from '../storage.types';

export interface LocalStorageProviderConfig {
  /**
   * The base path to the storage directory
   */
  basePath: string;
  /**
   * The base URL of the server
   */
  baseUrl: string;
}

export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly config: LocalStorageProviderConfig) {}

  async upload(
    containerId: string,
    body: Readable | Buffer | string,
    assetPath: string
  ): Promise<boolean> {
    const fullPath = getMediaContainerPath(containerId, {
      prefix: this.config.basePath,
      suffix: assetPath,
    });

    const dirPath = path.dirname(fullPath);
    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.writeFile(fullPath, body);

    return true;
  }

  async createSignedUrl(
    options: CreateSignedUrlOptions
  ): Promise<SignedUrlResponse> {
    const url = new URL(
      `/storage/default/${options.containerId}/${options.path}`,
      this.config.baseUrl
    ).href;
    return {
      url,
      expiresAt: addSeconds(new Date(), options.expiresInSeconds ?? 3600),
    };
  }
}
