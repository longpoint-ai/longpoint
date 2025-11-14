import { ConfigValues } from '@longpoint/config-schema';
import {
  EmbedAndUpsertDocument,
  SearchOptions,
  SearchResult,
  VectorDocument,
  VectorPluginManifest,
  VectorProvider,
} from './types.js';

export interface VectorProviderPluginArgs<
  T extends VectorPluginManifest = VectorPluginManifest
> {
  manifest: T;
  providerConfigValues: ConfigValues<T['providerConfigSchema']>;
}

export abstract class VectorProviderPlugin<
  T extends VectorPluginManifest = VectorPluginManifest
> implements VectorProvider
{
  readonly id: string;
  readonly name: string;
  readonly providerConfigValues: ConfigValues<T['providerConfigSchema']>;
  private readonly _manifest: T;

  constructor(args: VectorProviderPluginArgs<T>) {
    this.id = args.manifest.id;
    this.name = args.manifest.name ?? this.id;
    this.providerConfigValues = args.providerConfigValues;
    this._manifest = args.manifest;
  }

  abstract upsert(indexId: string, documents: VectorDocument[]): Promise<void>;
  abstract delete(indexId: string, documentIds: string[]): Promise<void>;
  abstract search(
    indexId: string,
    queryVector: number[],
    options?: SearchOptions
  ): Promise<SearchResult[]>;
  abstract dropIndex(name: string): Promise<void>;

  embedAndUpsert(
    indexId: string,
    documents: EmbedAndUpsertDocument[]
  ): Promise<void> {
    throw new Error(
      `Embed and upsert is not implemented by the vector provider plugin '${this.id}'.`
    );
  }

  embedAndSearch(
    indexId: string,
    queryText: string,
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    throw new Error(
      `Embed and search is not implemented by the vector provider plugin '${this.id}'.`
    );
  }

  get manifest(): T {
    return JSON.parse(JSON.stringify(this._manifest)) as T;
  }
}
