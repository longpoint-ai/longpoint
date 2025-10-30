import {
  AiModelManifest,
  AiModelPlugin,
  AiProviderPlugin,
  ClassifyArgs,
  ConfigSchema,
  ConfigValues,
  JsonObject,
} from '@longpoint/devkit';
import { parseBytes } from '@longpoint/utils/format';
import { validateConfigSchema, ValidationResult } from '@longpoint/validations';
import { AiModelParams } from '../dtos/model';
import { ModelOperationNotSupported } from '../errors';
import { AiProviderEntity } from './ai-provider.entity';

export interface AiModelEntityArgs {
  providerPluginInstance: AiProviderPlugin;
  providerEntity: AiProviderEntity;
  manifest: AiModelManifest;
}

export class AiModelEntity {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly maxFileSize: number;
  readonly provider: AiProviderEntity;
  private readonly providerPluginInstance: AiProviderPlugin;
  private readonly manifest: AiModelManifest;

  constructor(args: AiModelEntityArgs) {
    this.id = args.manifest.id;
    this.name = args.manifest.name ?? this.id;
    this.description = args.manifest.description ?? null;
    this.manifest = args.manifest;
    this.provider = args.providerEntity;
    this.providerPluginInstance = args.providerPluginInstance;
    this.maxFileSize = parseBytes(args.manifest.maxFileSize ?? '0B');
  }

  /**
   * Runs the classifier implementation of the underlying model plugin.
   * @param args
   * @returns
   */
  async classify(args: ClassifyArgs): Promise<JsonObject> {
    if (!this.isClassifier()) {
      throw new ModelOperationNotSupported('classify', this.id);
    }
    return this.getModelPluginInstance().classify(args);
  }

  /**
   * Whether the model supports content classification.
   * @returns true if the model supports content classification, false otherwise
   */
  isClassifier(): boolean {
    return !!this.manifest.classifier;
  }

  /**
   * Checks if a mime type is supported by the model.
   * @param mimeType
   * @returns true if the mime type is supported, false otherwise
   */
  isMimeTypeSupported(mimeType: string): boolean {
    return this.manifest.supportedMimeTypes?.includes(mimeType) ?? false;
  }

  toJson(): AiModelParams {
    return {
      id: this.id,
      fullyQualifiedId: this.fullyQualifiedId,
      name: this.name,
      description: this.description,
      provider: this.provider.toJson(),
      classifierInputSchema: this.classifierInputSchema,
    };
  }

  validateClassifierInput(input: ConfigValues = {}): ValidationResult {
    if (!this.isClassifier()) {
      return { valid: false, errors: ['Model is not a classifier'] };
    }
    return validateConfigSchema(this.manifest.classifier?.input ?? {}, input);
  }

  get classifierInputSchema(): ConfigSchema {
    return JSON.parse(JSON.stringify(this.manifest.classifier?.input ?? {}));
  }

  get fullyQualifiedId(): string {
    return `${this.provider.id}/${this.id}`;
  }

  private getModelPluginInstance(): AiModelPlugin {
    const model = this.providerPluginInstance.getModel(this.id);
    if (!model) {
      throw new Error(`Something went wrong getting the model instance`);
    }
    return model;
  }
}
