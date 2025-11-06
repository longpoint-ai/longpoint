import { ConfigSchemaService } from '@/modules/common/services';
import {
  CreateSignedUrlOptions,
  SignedUrlResponse,
  StorageProvider,
  StorageProviderPlugin,
} from '@longpoint/devkit';
import { Readable } from 'stream';
import { BaseStorageProviderEntity } from './base-storage-provider.entity';

export interface StorageProviderEntityArgs {
  storageProviderPlugin: StorageProviderPlugin;
  configSchemaService: ConfigSchemaService;
}

export class StorageProviderEntity
  extends BaseStorageProviderEntity
  implements StorageProvider
{
  private readonly plugin: StorageProviderPlugin;

  constructor(args: StorageProviderEntityArgs) {
    super({
      id: args.storageProviderPlugin.id,
      name: args.storageProviderPlugin.name,
      image: args.storageProviderPlugin.manifest.image,
      configSchema: args.storageProviderPlugin.manifest.configSchema,
      configSchemaService: args.configSchemaService,
    });
    this.plugin = args.storageProviderPlugin;
  }

  upload(path: string, body: Readable | Buffer | string): Promise<boolean> {
    return this.plugin.upload(path, body);
  }

  getFileContents(path: string): Promise<Buffer> {
    return this.plugin.getFileContents(path);
  }

  exists(path: string): Promise<boolean> {
    return this.plugin.exists(path);
  }

  deleteDirectory(path: string): Promise<void> {
    return this.plugin.deleteDirectory(path);
  }

  createSignedUrl(options: CreateSignedUrlOptions): Promise<SignedUrlResponse> {
    return this.plugin.createSignedUrl(options);
  }
}
