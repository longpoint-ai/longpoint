import { ConfigSchemaService } from '@/modules/common/services';
import { AiProviderPlugin } from '@longpoint/devkit';
import { AiModelShortDto } from '../dtos/ai-model-short.dto';
import { AiProviderSummaryDto } from '../dtos/ai-provider-summary.dto';
import { AiProviderDto } from '../dtos/ai-provider.dto';

export interface AiProviderEntityArgs {
  pluginInstance: AiProviderPlugin;
  configSchemaService: ConfigSchemaService;
}

export class AiProviderEntity {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
  private readonly pluginInstance: AiProviderPlugin;
  private readonly configSchemaService: ConfigSchemaService;

  constructor(args: AiProviderEntityArgs) {
    this.id = args.pluginInstance.id;
    this.name = args.pluginInstance.name ?? this.id;
    this.image = args.pluginInstance.manifest.provider.image;
    this.pluginInstance = args.pluginInstance;
    this.configSchemaService = args.configSchemaService;
  }

  toDto(): AiProviderDto {
    return new AiProviderDto({
      id: this.id,
      name: this.name,
      image: this.image ?? null,
      config: this.pluginInstance.configValues,
      needsConfig: this.needsConfig,
      configSchema: this.pluginInstance.manifest.provider.config,
      models: Object.keys(this.pluginInstance.manifest.models).map(
        (modelId) =>
          new AiModelShortDto({
            id: modelId,
            name: this.pluginInstance.manifest.models[modelId].name ?? modelId,
            description:
              this.pluginInstance.manifest.models[modelId].description ?? null,
            fullyQualifiedId: `${this.id}/${modelId}`,
          })
      ),
    });
  }

  toSummaryDto(): AiProviderSummaryDto {
    return new AiProviderSummaryDto({
      id: this.id,
      name: this.name,
      image: this.image ?? null,
      needsConfig: this.needsConfig,
    });
  }

  get needsConfig(): boolean {
    const configSchema = this.pluginInstance.manifest.provider.config;

    if (!configSchema) {
      return false;
    }

    const result = this.configSchemaService
      .get(configSchema)
      .validate(this.pluginInstance.configValues);

    return !result.valid;
  }
}
