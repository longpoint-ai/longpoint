import { StoragePluginManifest } from '@longpoint/devkit';

export const manifest = {
  displayName: 'Local Storage',
  configSchema: {},
} satisfies StoragePluginManifest;

export type LocalStoragePluginManifest = typeof manifest;
