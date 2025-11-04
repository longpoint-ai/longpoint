import { addSeconds } from 'date-fns';
import fs from 'fs';
import { dirname, join } from 'path';
import { Readable } from 'stream';
import {
  CreateSignedUrlOptions,
  SignedUrlResponse,
  StorageProvider,
} from '../../types/storage-provider.types';

export interface LocalStorageProviderConfig {
  /**
   * The base path to the storage directory
   */
  basePath: string;
  /**
   * The base URL of the server
   */
  baseUrl: string;
  /**
   * The storage unit ID
   */
  storageUnitId: string;
  /**
   * The base path for this storage unit (subdirectory within basePath)
   */
  unitBasePath: string;
}

export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly config: LocalStorageProviderConfig) {}

  /**
   * Construct the full path for a file.
   * The path parameter should be in format: {storageUnitId}/{containerId}/...
   * We prepend the basePath and use unitBasePath as the subdirectory for this storage unit.
   */
  private getFullPath(path: string): string {
    // Path format from getMediaContainerPath: {storageUnitId}/{containerId}/...
    // For local storage, we use unitBasePath as the subdirectory instead of storageUnitId
    // This allows multiple local storage units to have separate directories
    const pathWithoutStorageUnitId = path.split('/').slice(1).join('/');
    return join(
      this.config.basePath,
      this.config.unitBasePath,
      pathWithoutStorageUnitId
    );
  }

  async upload(
    path: string,
    body: Readable | Buffer | string
  ): Promise<boolean> {
    const fullPath = this.getFullPath(path);
    const dirPath = dirname(fullPath);
    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.writeFile(fullPath, body);
    return true;
  }

  async deleteDirectory(path: string): Promise<void> {
    const fullPath = this.getFullPath(path);
    await fs.promises.rm(fullPath, { recursive: true, force: true });
  }

  async getFileContents(path: string): Promise<Buffer> {
    const fullPath = this.getFullPath(path);
    return fs.promises.readFile(fullPath);
  }

  async exists(path: string): Promise<boolean> {
    const fullPath = this.getFullPath(path);
    try {
      await fs.promises.access(fullPath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
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
