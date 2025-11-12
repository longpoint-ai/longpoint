import { ConfigSchemaService } from '@/modules/common/services';
import { ConfigValues } from '@longpoint/config-schema';
import { VectorPluginManifest } from '@longpoint/devkit';
import { VectorProviderDto } from '../dtos/vector-provider.dto';

export interface BaseVectorProviderEntityArgs
  extends Pick<
    VectorPluginManifest,
    'id' | 'name' | 'image' | 'configSchema' | 'supportsEmbedding'
  > {
  configSchemaService: ConfigSchemaService;
}

/**
 * A discovery-friendly base class for vector provider entities.
 */
export class BaseVectorProviderEntity {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
  readonly supportsEmbedding: boolean;
  private readonly configSchema: VectorPluginManifest['configSchema'];
  private readonly configSchemaService: ConfigSchemaService;

  constructor(args: BaseVectorProviderEntityArgs) {
    this.id = args.id;
    this.name = args.name ?? this.id;
    this.image = args.image;
    this.supportsEmbedding = args.supportsEmbedding ?? false;
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
    return new VectorProviderDto({
      id: this.id,
      name: this.name,
      image: this.image,
      configSchema: this.configSchema,
      supportsEmbedding: this.supportsEmbedding,
    });
  }
}
