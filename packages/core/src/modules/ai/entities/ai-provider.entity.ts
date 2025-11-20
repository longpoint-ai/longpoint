import {
  ConfigSchemaService,
  PluginRegistryEntry,
} from '@/modules/common/services';
import { AiProviderPlugin } from '@longpoint/devkit';
import { AiModelShortDto } from '../dtos/ai-model-short.dto';
import { AiProviderSummaryDto } from '../dtos/ai-provider-summary.dto';
import { AiProviderDto } from '../dtos/ai-provider.dto';

export interface AiProviderEntityArgs {
  pluginRegistryEntry: PluginRegistryEntry<'ai'>;
  pluginInstance: AiProviderPlugin;
  configSchemaService: ConfigSchemaService;
}

export class AiProviderEntity {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
  private readonly pluginRegistryEntry: PluginRegistryEntry<'ai'>;
  private readonly pluginInstance: AiProviderPlugin;
  private readonly configSchemaService: ConfigSchemaService;

  constructor(args: AiProviderEntityArgs) {
    const { derivedId, manifest } = args.pluginRegistryEntry;
    this.id = derivedId;
    this.name = manifest.provider.name ?? derivedId;
    this.image = manifest.provider.image;
    this.pluginRegistryEntry = args.pluginRegistryEntry;
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
      configSchema: this.pluginRegistryEntry.manifest.provider.config,
      models: Object.keys(this.manifest.models).map(
        (modelId) =>
          new AiModelShortDto({
            id: modelId,
            name: this.manifest.models[modelId].name ?? modelId,
            description: this.manifest.models[modelId].description ?? null,
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
    const configSchema = this.manifest.provider.config;

    if (!configSchema) {
      return false;
    }

    const result = this.configSchemaService
      .get(configSchema)
      .validate(this.pluginInstance.configValues);

    return !result.valid;
  }

  private get manifest() {
    return this.pluginRegistryEntry.manifest;
  }
}
