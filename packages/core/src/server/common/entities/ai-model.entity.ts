import {
  AiModelPlugin,
  AiProviderPlugin,
  Classify,
  ClassifyArgs,
  JsonObject,
} from '@longpoint/devkit';
import { ModelSummaryParams } from '../dtos/model';
import { AiProviderEntity } from './ai-provider.entity';

export interface AiModelEntityArgs {
  id: string;
  name?: string;
  description?: string | null;
  providerPluginInstance: AiProviderPlugin;
  providerEntity: AiProviderEntity;
}

export class AiModelEntity implements Classify {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly provider: AiProviderEntity;
  private readonly providerPluginInstance: AiProviderPlugin;

  constructor(args: AiModelEntityArgs) {
    this.id = args.id;
    this.name = args.name ?? this.id;
    this.description = args.description ?? null;
    this.provider = args.providerEntity;
    this.providerPluginInstance = args.providerPluginInstance;
  }

  /**
   * Runs the classifier implementation of the underlying model plugin.
   * @param args
   * @returns
   */
  async classify(args: ClassifyArgs): Promise<JsonObject> {
    return this.getModelPluginInstance().classify(args);
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
