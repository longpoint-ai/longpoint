import { StoragePluginManifest } from '@longpoint/devkit';

export const manifest = {
  id: 'local',
  name: 'Local',
  configSchema: {},
  image: 'https://via.placeholder.com/150',
} satisfies StoragePluginManifest;

export type LocalStoragePluginManifest = typeof manifest;
