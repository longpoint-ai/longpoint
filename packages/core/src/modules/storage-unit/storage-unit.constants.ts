import { ConfigSchema } from '@longpoint/devkit';

/**
 * Storage provider configuration schemas for UI forms.
 * These schemas define the structure and validation rules for each provider type.
 *
 * This is the single source of truth for provider config schemas.
 * The backend uses STORAGE_PROVIDER_CONFIG_SCHEMAS from storage-provider-config.types.ts
 * which has the same structure but is used for encryption.
 */
export const STORAGE_PROVIDER_UI_CONFIG_SCHEMAS: Record<string, ConfigSchema> =
  {
    local: {
      basePath: { label: 'Base Path', type: 'string' },
    },
    s3: {
      bucketName: { label: 'Bucket Name', type: 'string' },
      region: { label: 'Region', type: 'string' },
      accessKeyId: { label: 'Access Key ID', type: 'secret' },
      secretKey: { label: 'Secret Key', type: 'secret' },
    },
    gcs: {
      bucketName: { label: 'Bucket Name', type: 'string' },
      serviceAccountKey: { label: 'Service Account Key', type: 'secret' },
    },
    'azure-blob': {
      containerName: { label: 'Container Name', type: 'string' },
      accountName: { label: 'Account Name', type: 'string' },
      accountKey: { label: 'Account Key', type: 'secret' },
    },
  };
