import { ConfigValues } from '@longpoint/config-schema';
import { AiModelManifest, AiPluginManifest } from './ai-manifest.js';
import { AiModelPlugin } from './ai-model-plugin.js';

export interface AiProviderPluginArgs<
  M extends AiPluginManifest = AiPluginManifest
> {
  manifest: M;
  configValues: ConfigValues<M['provider']['config']>;
}

export abstract class AiProviderPlugin<
  M extends AiPluginManifest = AiPluginManifest
> {
  readonly id: string;
  readonly name: string;
  readonly manifest: M;
  readonly configValues: ConfigValues<M['provider']['config']>;

  constructor(args: AiProviderPluginArgs<M>) {
    this.id = args.manifest.provider.id;
    this.name = args.manifest.provider.name ?? this.id;
    this.manifest = args.manifest;
    this.configValues = args.configValues;
  }

  /**
   * Returns an instance of a model based on the model ID.
   * @param id - The ID of the model to get the instance of.
   * @returns The instance of the model.
   */
  getModel(id: string): AiModelPlugin | null {
    const model = this.manifest.models[id];

    if (!model) {
      return null;
    }

    return this.getModelInstance(model);
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
  protected abstract getModelInstance(manifest: AiModelManifest): AiModelPlugin;
}
