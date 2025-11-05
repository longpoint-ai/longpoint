import { ConfigSchema } from '@longpoint/devkit';

/**
 * Base interface for all storage provider configurations
 */
export interface BaseStorageProviderConfig {
  [key: string]: unknown;
}

/**
 * Local storage provider configuration
 */
export interface LocalStorageProviderConfig extends BaseStorageProviderConfig {
  /**
   * The base path subdirectory for this storage unit
   * @example "default", "unit-1", "backup"
   */
  basePath: string;
}

/**
 * S3 storage provider configuration
 * Secrets (accessKeyId, secretKey) are encrypted in storage
 */
export interface S3StorageProviderConfig extends BaseStorageProviderConfig {
  bucketName: string;
  region: string;
  /**
   * AWS access key ID (encrypted when stored)
   */
  accessKeyId: string;
  /**
   * AWS secret access key (encrypted when stored)
   */
  secretKey: string;
}

/**
 * Google Cloud Storage provider configuration
 * Secrets (serviceAccountKey) are encrypted in storage
 */
export interface GcsStorageProviderConfig extends BaseStorageProviderConfig {
  bucketName: string;
  /**
   * GCP service account key JSON (encrypted when stored)
   */
  serviceAccountKey: string;
}

/**
 * Azure Blob Storage provider configuration
 * Secrets (accountKey) are encrypted in storage
 */
export interface AzureBlobStorageProviderConfig
  extends BaseStorageProviderConfig {
  containerName: string;
  accountName: string;
  /**
   * Azure storage account key (encrypted when stored)
   */
  accountKey: string;
}

/**
 * Type guard to check if config is for local storage
 */
export function isLocalStorageConfig(
  config: BaseStorageProviderConfig
): config is LocalStorageProviderConfig {
  return 'basePath' in config && typeof config.basePath === 'string';
}

/**
 * Type guard to check if config is for S3 storage
 */
export function isS3StorageConfig(
  config: BaseStorageProviderConfig
): config is S3StorageProviderConfig {
  return (
    'bucketName' in config &&
    'region' in config &&
    'accessKeyId' in config &&
    'secretKey' in config
  );
}

/**
 * Type guard to check if config is for GCS storage
 */
export function isGcsStorageConfig(
  config: BaseStorageProviderConfig
): config is GcsStorageProviderConfig {
  return 'bucketName' in config && 'serviceAccountKey' in config;
}

/**
 * Type guard to check if config is for Azure Blob storage
 */
export function isAzureBlobStorageConfig(
  config: BaseStorageProviderConfig
): config is AzureBlobStorageProviderConfig {
  return (
    'containerName' in config &&
    'accountName' in config &&
    'accountKey' in config
  );
}

/**
 * Config schemas for encryption/validation
 * Maps provider type to field names that should be encrypted
 */
export const STORAGE_PROVIDER_CONFIG_SCHEMAS: Record<string, ConfigSchema> = {
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
