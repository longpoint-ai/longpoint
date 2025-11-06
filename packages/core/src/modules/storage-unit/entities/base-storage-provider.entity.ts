import { ConfigSchemaService } from '@/modules/common/services';
import { ConfigValues } from '@longpoint/config-schema';
import { StoragePluginManifest } from '@longpoint/devkit';
import { StorageProviderDto, StorageProviderShortDto } from '../dtos';

export interface BaseStorageProviderEntityArgs
  extends Pick<
    StoragePluginManifest,
    'id' | 'name' | 'image' | 'configSchema'
  > {
  configSchemaService: ConfigSchemaService;
}

/**
 * A discovery-friendly base class for storage provider entities.
 */
export class BaseStorageProviderEntity {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
  private readonly configSchema: StoragePluginManifest['configSchema'];
  private readonly configSchemaService: ConfigSchemaService;

  constructor(args: BaseStorageProviderEntityArgs) {
    this.id = args.id;
    this.name = args.name ?? this.id;
    this.image = args.image;
    this.configSchema = args.configSchema;
    this.configSchemaService = args.configSchemaService;
  }

  processConfig(configValues: ConfigValues): Promise<ConfigValues> {
    return this.configSchemaService
      .get(this.configSchema)
      .processInboundValues(configValues);
  }

  processConfigFromDb(configValues: ConfigValues): Promise<ConfigValues> {
    return this.configSchemaService
      .get(this.configSchema)
      .processOutboundValues(configValues);
  }

  toDto() {
    return new StorageProviderDto({
      id: this.id,
      name: this.name,
      image: this.image,
      configSchema: this.configSchema,
    });
  }

  toShortDto() {
    return new StorageProviderShortDto({
      id: this.id,
      name: this.name,
      image: this.image,
    });
  }
}
