import {
  EmbedAndUpsertDocument,
  SearchOptions,
  SearchResult,
  VectorDocument,
  VectorPluginManifest,
  VectorProviderPlugin,
} from '@longpoint/devkit';
import { VectorProviderDto, VectorProviderShortDto } from '../dtos';

export interface VectorProviderEntityArgs {
  plugin: VectorProviderPlugin;
}

export class VectorProviderEntity {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
  readonly supportsEmbedding: boolean;
  private readonly configSchema: VectorPluginManifest['configSchema'];

  private readonly plugin: VectorProviderPlugin;

  constructor(args: VectorProviderEntityArgs) {
    this.id = args.plugin.id;
    this.name = args.plugin.name ?? this.id;
    this.image = args.plugin.manifest.image;
    this.supportsEmbedding = args.plugin.manifest.supportsEmbedding ?? false;
    this.configSchema = args.plugin.manifest.configSchema;
    this.plugin = args.plugin;
  }

  upsert(indexId: string, documents: VectorDocument[]): Promise<void> {
    return this.plugin.upsert(indexId, documents);
  }

  embedAndUpsert(
    indexName: string,
    documents: EmbedAndUpsertDocument[]
  ): Promise<void> {
    return this.plugin.embedAndUpsert(indexName, documents);
  }

  deleteDocuments(indexId: string, documentIds: string[]): Promise<void> {
    return this.plugin.delete(indexId, documentIds);
  }

  search(
    indexId: string,
    queryVector: number[],
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    return this.plugin.search(indexId, queryVector, options);
  }

  embedAndSearch(
    indexId: string,
    queryText: string,
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    return this.plugin.embedAndSearch(indexId, queryText, options);
  }

  dropIndex(indexId: string): Promise<void> {
    return this.plugin.dropIndex(indexId);
  }

  toDto() {
    return new VectorProviderDto({
      id: this.id,
      name: this.name,
      image: this.image,
      configSchema: this.configSchema,
      supportsEmbedding: this.supportsEmbedding,
      config: this.plugin.configValues,
    });
  }

  toShortDto() {
    return new VectorProviderShortDto({
      id: this.id,
      name: this.name,
      image: this.image,
    });
  }
}
