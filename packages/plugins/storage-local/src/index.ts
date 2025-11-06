import { PluginConfig } from '@longpoint/devkit';
import { LocalStorageProvider } from './local.js';
import { manifest } from './manifest.js';

export default {
  type: 'storage',
  provider: LocalStorageProvider,
  manifest,
} satisfies PluginConfig;
