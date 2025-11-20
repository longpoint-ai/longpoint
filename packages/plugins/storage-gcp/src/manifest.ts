import { StoragePluginManifest } from '@longpoint/devkit';

export const manifest = {
  displayName: 'Google Cloud Storage',
  image: 'icon.png',
  configSchema: {
    bucket: {
      label: 'Bucket',
      description: 'The GCS bucket name.',
      type: 'string',
      immutable: true,
      required: true,
    },
    projectId: {
      label: 'Project ID',
      description:
        'The GCP project ID. If not provided, it will be inferred from the service account key.',
      type: 'string',
      immutable: false,
      required: false,
    },
    serviceAccountKey: {
      label: 'Service Account Key',
      description: 'Service account JSON key as a string.',
      type: 'secret',
      immutable: false,
      required: true,
    },
  },
} satisfies StoragePluginManifest;

export type GCPStoragePluginManifest = typeof manifest;
