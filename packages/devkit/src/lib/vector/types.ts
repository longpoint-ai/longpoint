import { ConfigSchemaDefinition } from '@longpoint/config-schema';

export interface VectorPluginManifest {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  supportsEmbedding?: boolean;
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
  upsert(indexId: string, documents: VectorDocument[]): Promise<void>;
  embedAndUpsert(
    indexId: string,
    documents: EmbedAndUpsertDocument[]
  ): Promise<void>;
  delete(indexId: string, documentIds: string[]): Promise<void>;
  search(
    indexId: string,
    queryVector: number[],
    options?: SearchOptions
  ): Promise<SearchResult[]>;
  embedAndSearch(
    indexId: string,
    queryText: string,
    options?: SearchOptions
  ): Promise<SearchResult[]>;
  dropIndex(indexId: string): Promise<void>;
}
