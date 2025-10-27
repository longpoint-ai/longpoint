import {
  AiModelManifest,
  AiModelPlugin,
  AiProviderPlugin,
  ClassifyArgs,
  JsonObject,
} from '@longpoint/devkit';
import { parseBytes } from '@longpoint/utils/format';
import { ModelSummaryParams } from '../dtos/model';
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
  readonly supportedMimeTypes: string[];
  readonly maxFileSize: number;
  readonly provider: AiProviderEntity;
  private readonly providerPluginInstance: AiProviderPlugin;

  constructor(args: AiModelEntityArgs) {
    this.id = args.manifest.id;
    this.name = args.manifest.name ?? this.id;
    this.description = args.manifest.description ?? null;
    this.supportedMimeTypes = args.manifest.supportedMimeTypes ?? [];
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
    return this.getModelPluginInstance().classify(args);
  }

  /**
   * Checks if a mime type is supported by the model.
   * @param mimeType
   * @returns true if the mime type is supported, false otherwise
   */
  isMimeTypeSupported(mimeType: string): boolean {
    return this.supportedMimeTypes.includes(mimeType);
  }

  toJson(): ModelSummaryParams {
    return {
      id: this.id,
      fullyQualifiedId: this.fullyQualifiedId,
      name: this.name,
      description: this.description,
      provider: this.provider.toJson(),
    };
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
