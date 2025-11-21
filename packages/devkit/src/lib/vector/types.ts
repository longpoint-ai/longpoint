import { ConfigSchemaDefinition } from '@longpoint/config-schema';

export interface VectorPluginManifest {
  displayName?: string;
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

export interface SearchResult {
  id: string;
  score: number;
  metadata?: VectorMetadata;
}
