import { PluginConfig } from '@longpoint/devkit';
import { GCPStorageProvider } from './gcp.js';
import { manifest } from './manifest.js';

export default {
  type: 'storage',
  provider: GCPStorageProvider,
  manifest,
} satisfies PluginConfig;
