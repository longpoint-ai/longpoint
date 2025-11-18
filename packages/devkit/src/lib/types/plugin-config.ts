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
import { VectorPluginManifest } from '../vector/types.js';
import {
  VectorProviderPlugin,
  VectorProviderPluginArgs,
} from '../vector/vector-provider-plugin.js';

type PluginType = 'storage' | 'ai' | 'vector';

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

export interface VectorPluginConfig<
  T extends VectorPluginManifest = VectorPluginManifest
> extends BasePluginConfig {
  type: 'vector';
  manifest: T;
  provider: new (args: VectorProviderPluginArgs<T>) => VectorProviderPlugin<T>;
}

export type PluginConfig =
  | StoragePluginConfig<any>
  | AiPluginConfig<any>
  | VectorPluginConfig<any>;
