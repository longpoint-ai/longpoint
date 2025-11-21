import {
  ConfigSchemaService,
  PluginRegistryEntry,
} from '@/modules/common/services';
import { StorageProvider, StorageProviderPlugin } from '@longpoint/devkit';
import { Readable } from 'stream';
import { BaseStorageProviderEntity } from './base-storage-provider.entity';

export interface StorageProviderEntityArgs {
  pluginInstance: StorageProviderPlugin;
  pluginRegistryEntry: PluginRegistryEntry<'storage'>;
  configSchemaService: ConfigSchemaService;
}

export class StorageProviderEntity
  extends BaseStorageProviderEntity
  implements StorageProvider
{
  private readonly pluginInstance: StorageProviderPlugin;

  constructor(args: StorageProviderEntityArgs) {
    const { derivedId, manifest } = args.pluginRegistryEntry;
    super({
      id: derivedId,
      displayName: manifest.displayName,
      image: manifest.image,
      configSchema: manifest.configSchema,
      configSchemaService: args.configSchemaService,
    });
    this.pluginInstance = args.pluginInstance;
  }

  upload(path: string, body: Readable | Buffer | string): Promise<boolean> {
    return this.pluginInstance.upload(path, body);
  }

  getFileStream(path: string): Promise<Readable> {
    return this.pluginInstance.getFileStream(path);
  }

  getFileContents(path: string): Promise<Buffer> {
    return this.pluginInstance.getFileContents(path);
  }

  exists(path: string): Promise<boolean> {
    return this.pluginInstance.exists(path);
  }

  deleteDirectory(path: string): Promise<void> {
    return this.pluginInstance.deleteDirectory(path);
  }
}
