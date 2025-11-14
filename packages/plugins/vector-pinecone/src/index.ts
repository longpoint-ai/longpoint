import { PluginConfig } from '@longpoint/devkit';
import { manifest } from './manifest.js';
import { PineconeVectorProvider } from './pinecone.js';

export default {
  type: 'vector',
  manifest,
  provider: PineconeVectorProvider,
} satisfies PluginConfig;
