import { AiPluginManifest } from '../ai/ai-manifest.js';
import {
  AiProviderPlugin,
  AiProviderPluginArgs,
} from '../ai/ai-provider-plugin.js';
import {
  StoragePluginManifest,
  StorageProviderPlugin,
  StorageProviderPluginArgs,
} from '../storage/index.js';

type PluginType = 'storage' | 'ai';

export interface BasePluginConfig {
  /**
   * The plugin type
   */
  type: PluginType;
}

export interface StoragePluginConfig<
  T extends StoragePluginManifest = StoragePluginManifest
> extends BasePluginConfig {
  type: 'storage';
  manifest: T;
  provider: new (
    args: StorageProviderPluginArgs<T>
  ) => StorageProviderPlugin<T>;
}

export interface AiPluginConfig<T extends AiPluginManifest = AiPluginManifest>
  extends BasePluginConfig {
  type: 'ai';
  manifest: T;
  provider: new (args: AiProviderPluginArgs<T>) => AiProviderPlugin<T>;
}

export type PluginConfig = StoragePluginConfig<any> | AiPluginConfig<any>;
