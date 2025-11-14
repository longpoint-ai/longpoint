import { VectorPluginManifest } from '@longpoint/devkit';

export const manifest = {
  id: 'pinecone',
  name: 'Pinecone',
  description:
    'The purpose-built vector database delivering relevant results at any scale',
  image: 'icon.png',
  supportsEmbedding: true,
  providerConfigSchema: {
    apiKey: {
      label: 'API Key',
      type: 'secret',
      required: true,
    },
  },
} satisfies VectorPluginManifest;
