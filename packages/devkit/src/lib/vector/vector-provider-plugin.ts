import { ConfigValues } from '@longpoint/config-schema';
import {
  EmbedAndUpsertDocument,
  SearchResult,
  VectorDocument,
  VectorPluginManifest,
} from './types.js';

export interface VectorProviderPluginArgs<
  T extends VectorPluginManifest = VectorPluginManifest
> {
  providerConfigValues: ConfigValues<T['providerConfigSchema']>;
}

export abstract class VectorProviderPlugin<
  T extends VectorPluginManifest = VectorPluginManifest
> {
  readonly providerConfigValues: ConfigValues<T['providerConfigSchema']>;

  constructor(args: VectorProviderPluginArgs<T>) {
    this.providerConfigValues = args.providerConfigValues;
  }

  abstract upsert(
    documents: VectorDocument[],
    indexConfigValues: ConfigValues<T['indexConfigSchema']>
  ): Promise<void>;
  abstract delete(
    documentIds: string[],
    indexConfigValues: ConfigValues<T['indexConfigSchema']>
  ): Promise<void>;
  abstract search(
    queryVector: number[],
    indexConfigValues: ConfigValues<T['indexConfigSchema']>
  ): Promise<SearchResult[]>;
  abstract dropIndex(
    indexConfigValues: ConfigValues<T['indexConfigSchema']>
  ): Promise<void>;

  embedAndUpsert(
    documents: EmbedAndUpsertDocument[],
    indexConfigValues: ConfigValues<T['indexConfigSchema']>
  ): Promise<void> {
    throw new Error(
      `Embed and upsert is not implemented by the vector provider plugin.`
    );
  }

  embedAndSearch(
    queryText: string,
    indexConfigValues: ConfigValues<T['indexConfigSchema']>
  ): Promise<SearchResult[]> {
    throw new Error(
      `Embed and search is not implemented by the vector provider plugin.`
    );
  }
}
