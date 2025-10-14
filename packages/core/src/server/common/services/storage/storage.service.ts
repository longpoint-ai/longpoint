import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { LocalStorageProvider } from './storage-providers';
import { StorageProvider } from './storage.types';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Return the default storage provider.
   *
   * @returns The default storage provider.
   */
  async getDefaultProvider(): Promise<StorageProvider> {
    return new LocalStorageProvider({
      basePath: this.configService.get('storage.localBasePath'),
      baseUrl: this.configService.get('server.baseUrl'),
    });
  }

  /**
   * Return the storage provider for a given container id.
   *
   * __TODO__: Update when multi-providers are supported
   * @param containerId
   * @returns The storage provider for the given container id.
   */
  async getProviderByContainerId(
    containerId: string
  ): Promise<StorageProvider> {
    return this.getDefaultProvider();
  }
}
