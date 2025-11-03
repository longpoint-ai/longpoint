import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../services/config/config.service';
import { StorageProvider } from '../../types/storage-provider.types';
import { LocalStorageProvider } from './local.storage-provider';

@Injectable()
export class StorageProviderFactory {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Return the default storage provider.
   *
   * @returns The default storage provider.
   */
  async getDefaultProvider(): Promise<StorageProvider> {
    return new LocalStorageProvider({
      basePath: this.configService.get('storage.localBasePath'),
      baseUrl: this.configService.get('server.origin'),
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
