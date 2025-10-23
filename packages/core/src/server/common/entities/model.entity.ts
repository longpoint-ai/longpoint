import { AiManifest, AiModel, ConfigValues } from '@longpoint/devkit';
import { validateConfigSchema } from '@longpoint/validations';
import { ModelSummaryParams } from '../dtos/model';

export class AiModelEntity extends AiModel {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly fullyQualifiedId: string;
  private readonly providerConfig?: ConfigValues;
  private readonly rootManifest: AiManifest;

  constructor(
    modelId: string,
    rootManifest: AiManifest,
    baseModel: AiModel,
    providerConfig?: ConfigValues
  ) {
    const modelManifest = rootManifest.provider.models.find(
      (m) => m.id === modelId
    );

    if (!modelManifest) {
      throw new Error(`Model manifest not found for: ${modelId}`);
    }

    super(modelManifest);
    this.id = modelId;
    this.name = modelManifest.name ?? this.id;
    this.description = modelManifest.description ?? null;
    this.fullyQualifiedId = `${rootManifest.provider.id}/${this.id}`;
    this.providerConfig = providerConfig;
    this.rootManifest = rootManifest;
    Object.assign(this, baseModel);
  }

  providerNeedsConfig(): boolean {
    const configSchema = this.rootManifest.provider.config;

    if (!configSchema) {
      return false;
    }

    const result = validateConfigSchema(
      configSchema,
      this.providerConfig ?? {}
    );

    return !result.valid;
  }

  toJson(): ModelSummaryParams {
    return {
      id: this.id,
      fullyQualifiedId: this.fullyQualifiedId,
      name: this.name,
      description: this.description,
      provider: {
        id: this.rootManifest.provider.id,
        name: this.rootManifest.provider.name,
        image: this.rootManifest.provider.image,
        needsConfig: this.providerNeedsConfig(),
      },
    };
  }
}
