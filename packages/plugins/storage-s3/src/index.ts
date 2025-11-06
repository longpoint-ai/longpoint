import { PluginConfig } from '@longpoint/devkit';
import { manifest } from './manifest.js';
import { S3StorageProvider } from './s3.js';

export default {
  type: 'storage',
  provider: S3StorageProvider,
  manifest,
} satisfies PluginConfig;
