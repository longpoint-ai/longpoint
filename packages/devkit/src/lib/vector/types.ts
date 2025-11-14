import { ConfigSchemaDefinition } from '@longpoint/config-schema';

export interface VectorPluginManifest {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  supportsEmbedding?: boolean;
  indexConfigSchema?: ConfigSchemaDefinition;
  providerConfigSchema?: ConfigSchemaDefinition;
}

export interface VectorMetadata {
  [key: string]: string | number | boolean;
}

interface BaseVectorDocument {
  id: string;
  metadata?: VectorMetadata;
}

export interface VectorDocument extends BaseVectorDocument {
  embedding: number[];
}

export interface EmbedAndUpsertDocument extends BaseVectorDocument {
  text: string;
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata?: VectorMetadata;
}

export interface VectorProvider {
  upsert(documents: VectorDocument[]): Promise<void>;
  embedAndUpsert(documents: EmbedAndUpsertDocument[]): Promise<void>;
  delete(documentIds: string[]): Promise<void>;
  search(
    queryVector: number[],
    options?: SearchOptions
  ): Promise<SearchResult[]>;
  embedAndSearch(
    queryText: string,
    options?: SearchOptions
  ): Promise<SearchResult[]>;
  dropIndex(): Promise<void>;
}
