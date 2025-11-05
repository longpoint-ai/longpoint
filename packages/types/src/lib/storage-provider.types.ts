import { ConfigSchema } from '@longpoint/devkit';

export const NativeStorageProvider = {
  LOCAL: 'local',
  S3: 's3',
  GCS: 'gcs',
  AZURE_BLOB: 'azure-blob',
} as const;

export type NativeStorageProvider =
  (typeof NativeStorageProvider)[keyof typeof NativeStorageProvider];

export const STORAGE_PROVIDER_CONFIG_SCHEMAS: Record<
  NativeStorageProvider,
  ConfigSchema
> = {
  [NativeStorageProvider.LOCAL]: {
    basePath: { label: 'Base Path', type: 'string', required: true },
  },
  [NativeStorageProvider.S3]: {
    bucketName: { label: 'Bucket Name', type: 'string', required: true },
    region: { label: 'Region', type: 'string', required: true },
    accessKeyId: { label: 'Access Key ID', type: 'secret', required: true },
    secretKey: { label: 'Secret Key', type: 'secret', required: true },
  },
  [NativeStorageProvider.GCS]: {
    bucketName: { label: 'Bucket Name', type: 'string', required: true },
    serviceAccountKey: {
      label: 'Service Account Key',
      type: 'secret',
      required: true,
    },
  },
  [NativeStorageProvider.AZURE_BLOB]: {
    containerName: { label: 'Container Name', type: 'string', required: true },
    accountName: { label: 'Account Name', type: 'string', required: true },
    accountKey: { label: 'Account Key', type: 'secret', required: true },
  },
};
