import { AiProviderPlugin } from '@longpoint/devkit';
import { validateConfigSchema } from '@longpoint/validations';
import { AiProviderParams } from '../dtos/ai-provider';

export interface AiProviderEntityArgs {
  pluginInstance: AiProviderPlugin;
}

export class AiProviderEntity {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
  private readonly pluginInstance: AiProviderPlugin;

  constructor(args: AiProviderEntityArgs) {
    this.id = args.pluginInstance.id;
    this.name = args.pluginInstance.name ?? this.id;
    this.image = args.pluginInstance.manifest.provider.image;
    this.pluginInstance = args.pluginInstance;
  }

  toJson(): AiProviderParams {
    return {
      id: this.id,
      name: this.name,
      image: this.image ?? null,
      config: this.pluginInstance.configValues,
      needsConfig: this.needsConfig,
      configSchema: this.pluginInstance.manifest.provider.config,
      models: Object.keys(this.pluginInstance.manifest.models).map(
        (modelId) => ({
          id: modelId,
          name: this.pluginInstance.manifest.models[modelId].name ?? modelId,
          description:
            this.pluginInstance.manifest.models[modelId].description ?? null,
          fullyQualifiedId: `${this.id}/${modelId}`,
        })
      ),
    };
  }

  get needsConfig(): boolean {
    const configSchema = this.pluginInstance.manifest.provider.config;

    if (!configSchema) {
      return false;
    }

    const result = validateConfigSchema(
      configSchema,
      this.pluginInstance.configValues
    );

    return !result.valid;
  }
}
