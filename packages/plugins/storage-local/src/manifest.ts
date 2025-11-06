import { StoragePluginManifest } from '@longpoint/devkit';

export const manifest = {
  id: 'local',
  name: 'Local',
  configSchema: {
    basePath: {
      label: 'Base Path',
      description: 'The relative folder path for this storage unit.',
      type: 'string',
      immutable: true,
      required: true,
    },
  },
  image: 'https://via.placeholder.com/150',
} satisfies StoragePluginManifest;

export type LocalStoragePluginManifest = typeof manifest;
