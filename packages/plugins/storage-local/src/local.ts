import {
  CreateSignedUrlOptions,
  SignedUrlResponse,
  StorageProviderPlugin,
} from '@longpoint/devkit';
import { addSeconds } from 'date-fns';
import fs from 'fs';
import { dirname, join } from 'path';
import { Readable } from 'stream';
import { LocalStoragePluginManifest } from './manifest.js';

export class LocalStorageProvider extends StorageProviderPlugin<LocalStoragePluginManifest> {
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
    const url = new URL(`/storage/${strippedLeadingSlash}`, this.baseUrl).href;
    return {
      url,
      expiresAt: addSeconds(new Date(), options.expiresInSeconds ?? 3600),
    };
  }

  /**
   * Construct the full path for a file.
   * The path parameter should be in format: {prefix}/{storageUnitId}/{containerId}/...
   * We prepend LOCAL_STORAGE_ROOT to the full path.
   */
  private getFullPath(path: string): string {
    const localStorageRoot =
      process.env['LOCAL_STORAGE_ROOT'] ?? 'data/storage';
    return join(localStorageRoot, path);
  }
}
