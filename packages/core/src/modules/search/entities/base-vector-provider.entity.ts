import { ConfigSchemaService } from '@/modules/common/services';
import { ConfigValues } from '@longpoint/config-schema';
import { VectorPluginManifest } from '@longpoint/devkit';
import { VectorProviderDto, VectorProviderShortDto } from '../dtos';

export interface BaseVectorProviderEntityArgs
  extends Pick<
    VectorPluginManifest,
    | 'id'
    | 'name'
    | 'image'
    | 'supportsEmbedding'
    | 'providerConfigSchema'
    | 'indexConfigSchema'
  > {
  providerConfigValues: ConfigValues<
    VectorPluginManifest['providerConfigSchema']
  >;
  configSchemaService: ConfigSchemaService;
}

export class BaseVectorProviderEntity {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
  readonly supportsEmbedding: boolean;
  readonly indexConfigSchema: VectorPluginManifest['indexConfigSchema'];
  private readonly providerConfigValues: ConfigValues<
    VectorPluginManifest['providerConfigSchema']
  >;
  private readonly providerConfigSchema: VectorPluginManifest['providerConfigSchema'];
  private readonly configSchemaService: ConfigSchemaService;

  constructor(args: BaseVectorProviderEntityArgs) {
    this.id = args.id;
    this.name = args.name ?? this.id;
    this.image = args.image;
    this.supportsEmbedding = args.supportsEmbedding ?? false;
    this.providerConfigSchema = args.providerConfigSchema;
    this.providerConfigValues = args.providerConfigValues;
    this.configSchemaService = args.configSchemaService;
    this.indexConfigSchema = args.indexConfigSchema;
  }

  processConfigFromDb(configValues: ConfigValues): Promise<ConfigValues> {
    return this.configSchemaService
      .get(this.providerConfigSchema)
      .processOutboundValues(configValues);
  }

  processIndexConfigFromDb(configValues: ConfigValues): Promise<ConfigValues> {
    return this.configSchemaService
      .get(this.indexConfigSchema)
      .processOutboundValues(configValues);
  }

  toDto() {
    return new VectorProviderDto({
      id: this.id,
      name: this.name,
      image: this.image,
      supportsEmbedding: this.supportsEmbedding,
      config: this.providerConfigValues,
      configSchema: this.providerConfigSchema,
      indexConfigSchema: this.indexConfigSchema,
    });
  }

  toShortDto() {
    return new VectorProviderShortDto({
      id: this.id,
      name: this.name,
      image: this.image,
    });
  }
}
