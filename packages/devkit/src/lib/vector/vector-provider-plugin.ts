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
  indexConfigValues: ConfigValues<T['indexConfigSchema']>;
}

export abstract class VectorProviderPlugin<
  T extends VectorPluginManifest = VectorPluginManifest
> implements VectorProvider
{
  readonly id: string;
  readonly name: string;
  readonly providerConfigValues: ConfigValues<T['providerConfigSchema']>;
  protected readonly indexConfigValues: ConfigValues<T['indexConfigSchema']>;
  private readonly _manifest: T;

  constructor(args: VectorProviderPluginArgs<T>) {
    this.id = args.manifest.id;
    this.name = args.manifest.name ?? this.id;
    this.providerConfigValues = args.providerConfigValues;
    this.indexConfigValues = args.indexConfigValues;
    this._manifest = args.manifest;
  }

  abstract upsert(documents: VectorDocument[]): Promise<void>;
  abstract delete(documentIds: string[]): Promise<void>;
  abstract search(
    queryVector: number[],
    options?: SearchOptions
  ): Promise<SearchResult[]>;
  abstract dropIndex(): Promise<void>;

  embedAndUpsert(documents: EmbedAndUpsertDocument[]): Promise<void> {
    throw new Error(
      `Embed and upsert is not implemented by the vector provider plugin '${this.id}'.`
    );
  }

  embedAndSearch(
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
