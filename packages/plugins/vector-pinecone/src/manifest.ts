import { VectorPluginManifest } from '@longpoint/devkit';

export const manifest = {
  displayName: 'Pinecone',
  description:
    'The purpose-built vector database delivering relevant results at any scale',
  image: 'icon.png',
  supportsEmbedding: true,
  indexConfigSchema: {
    name: {
      label: 'Pinecone Index Name',
      type: 'string',
      required: true,
      immutable: true,
      description: 'The name of the index in Pinecone',
    },
    limit: {
      label: 'Search Limit',
      type: 'number',
      required: false,
      description:
        'Maximum number of results to return from search queries (default: 10)',
    },
  },
  providerConfigSchema: {
    apiKey: {
      label: 'API Key',
      type: 'secret',
      required: true,
    },
  },
} satisfies VectorPluginManifest;

export type PineconeVectorPluginManifest = typeof manifest;
