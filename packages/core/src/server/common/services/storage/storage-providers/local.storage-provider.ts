import { addSeconds } from 'date-fns';
import fs from 'fs';
import { dirname, join } from 'path';
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
    path: string,
    body: Readable | Buffer | string
  ): Promise<boolean> {
    const fullPath = join(this.config.basePath, path);
    const dirPath = dirname(fullPath);
    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.writeFile(fullPath, body);
    return true;
  }

  async deleteDirectory(path: string): Promise<void> {
    const fullPath = join(this.config.basePath, path);
    await fs.promises.rm(fullPath, { recursive: true, force: true });
  }

  async createSignedUrl(
    options: CreateSignedUrlOptions
  ): Promise<SignedUrlResponse> {
    const strippedLeadingSlash = options.path.replace(/^\/+/, '');
    const url = new URL(`/storage/${strippedLeadingSlash}`, this.config.baseUrl)
      .href;
    return {
      url,
      expiresAt: addSeconds(new Date(), options.expiresInSeconds ?? 3600),
    };
  }
}
