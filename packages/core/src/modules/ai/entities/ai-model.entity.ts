import { ConfigSchemaService } from '@/modules/common/services';
import { ConfigSchemaDefinition, ConfigValues } from '@longpoint/config-schema';
import {
  AiModelManifest,
  AiModelPlugin,
  AiProviderPlugin,
  ClassifyArgs,
} from '@longpoint/devkit';
import { JsonObject } from '@longpoint/types';
import { parseBytes } from '@longpoint/utils/format';
import { ClassifierNotSupported } from '../ai.errors';
import { AiModelDto, AiModelSummaryDto } from '../dtos';
import { AiProviderEntity } from './ai-provider.entity';

export interface AiModelEntityArgs {
  configSchemaService: ConfigSchemaService;
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
  private readonly configSchemaService: ConfigSchemaService;

  constructor(args: AiModelEntityArgs) {
    this.id = args.manifest.id;
    this.name = args.manifest.name ?? this.id;
    this.description = args.manifest.description ?? null;
    this.manifest = args.manifest;
    this.provider = args.providerEntity;
    this.providerPluginInstance = args.providerPluginInstance;
    this.maxFileSize = parseBytes(args.manifest.maxFileSize ?? '0B');
    this.configSchemaService = args.configSchemaService;
  }

  /**
   * Runs the classifier implementation of the underlying model plugin.
   * @param args
   * @returns
   */
  async classify(args: ClassifyArgs): Promise<JsonObject> {
    if (!this.isClassifier()) {
      throw new ClassifierNotSupported(this.id);
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

  /**
   * Validates and encrypts (when necessary) the classifier input values.
   * @param input
   * @returns the processed input values
   */
  async processInboundClassifierInput(
    input: ConfigValues = {}
  ): Promise<ConfigValues> {
    if (!this.isClassifier()) {
      throw new ClassifierNotSupported(this.id);
    }
    return await this.configSchemaService
      .get(this.classifierInputSchema)
      .processInboundValues(input);
  }

  toDto(): AiModelDto {
    return new AiModelDto({
      id: this.id,
      fullyQualifiedId: this.fullyQualifiedId,
      name: this.name,
      description: this.description,
      provider: this.provider.toDto(),
      classifierInputSchema: this.classifierInputSchema,
    });
  }

  toSummaryDto(): AiModelSummaryDto {
    return new AiModelSummaryDto({
      id: this.id,
      fullyQualifiedId: this.fullyQualifiedId,
      name: this.name,
      description: this.description,
      provider: this.provider.toSummaryDto(),
    });
  }

  get classifierInputSchema(): ConfigSchemaDefinition {
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
