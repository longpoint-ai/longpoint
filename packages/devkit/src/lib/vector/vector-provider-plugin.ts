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
  configValues: ConfigValues<T['configSchema']>;
}

export abstract class VectorProviderPlugin<
  T extends VectorPluginManifest = VectorPluginManifest
> implements VectorProvider
{
  readonly id: string;
  readonly name: string;
  readonly configValues: ConfigValues<T['configSchema']>;
  private readonly _manifest: T;

  constructor(args: VectorProviderPluginArgs<T>) {
    this.id = args.manifest.id;
    this.name = args.manifest.name ?? this.id;
    this.configValues = args.configValues;
    this._manifest = args.manifest;
  }

  abstract upsert(indexId: string, documents: VectorDocument[]): Promise<void>;
  abstract delete(indexId: string, documentIds: string[]): Promise<void>;
  abstract search(
    indexId: string,
    queryVector: number[],
    options?: SearchOptions
  ): Promise<SearchResult[]>;
  abstract dropIndex(indexId: string): Promise<void>;

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
