import { StoragePluginManifest } from '@longpoint/devkit';

export const manifest = {
  id: 'local',
  name: 'Local',
  configSchema: {
    basePath: {
      label: 'Base Path',
      type: 'string',
    },
  },
  image: 'https://via.placeholder.com/150',
} satisfies StoragePluginManifest;

export type LocalStoragePluginManifest = typeof manifest;
