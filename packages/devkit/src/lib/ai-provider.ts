import { AiManifest, AiModelManifest } from './ai-manifest.js';
import { AiModel } from './ai-model.js';
import { ConfigValues } from './types.js';

export interface AiProviderArgs<M extends AiManifest = AiManifest> {
  manifest: M['provider'];
  configValues: ConfigValues<M['provider']['config']>;
  modelConfigValues: {
    [modelId: string]: ConfigValues;
  };
}

export abstract class AiProvider<M extends AiManifest = AiManifest> {
  readonly id: string;
  readonly name: string;
  readonly models: M['provider']['models'];
  readonly configValues: ConfigValues<M['provider']['config']>;
  private readonly modelConfigValues: {
    [modelId: string]: ConfigValues;
  };

  constructor(args: AiProviderArgs<M>) {
    this.id = args.manifest.id;
    this.name = args.manifest.name ?? this.id;
    this.models = args.manifest.models;
    this.configValues = args.configValues;
    this.modelConfigValues = args.modelConfigValues;
  }

  /**
   * Returns an instance of a model based on the model ID.
   * @param id - The ID of the model to get the instance of.
   * @returns The instance of the model.
   */
  getModel(id: string): AiModel {
    const model = this.models.find((model) => model.id === id);

    if (!model) {
      throw new Error(`Model ${id} not found`);
    }

    const configValues = this.modelConfigValues[model.id] ?? {};

    return this.getModelInstance(model, configValues);
  }

  /**
   * Returns an instance of a model based on the manifest and model configuration values.
   *
   * This method is intended to be overridden by subclasses to provide the actual implementation of
   * instantiating the model.
   * @param manifest - The manifest of the model to get the instance of.
   * @param configValues - The config values of the model to get the instance of.
   * @protected
   * @returns An instance of the model.
   */
  protected abstract getModelInstance(
    manifest: AiModelManifest,
    configValues: ConfigValues
  ): AiModel;
}
