/**
 * Storage provider configuration schemas.
 *
 * This is a client-side copy of the schemas defined in the backend.
 * The schemas are also available via the API endpoint: GET /storage-units/provider-config-schemas
 *
 * For now, we maintain this copy to avoid API calls during form rendering.
 * In the future, we could fetch these from the API on app initialization.
 */
export const STORAGE_PROVIDER_CONFIG_SCHEMAS: Record<
  string,
  Record<string, { label: string; type: string; required?: boolean }>
> = {
  local: {
    basePath: { label: 'Base Path', type: 'string', required: true },
  },
  s3: {
    bucketName: { label: 'Bucket Name', type: 'string', required: true },
    region: { label: 'Region', type: 'string', required: true },
    accessKeyId: { label: 'Access Key ID', type: 'secret', required: true },
    secretKey: { label: 'Secret Key', type: 'secret', required: true },
  },
  gcs: {
    bucketName: { label: 'Bucket Name', type: 'string', required: true },
    serviceAccountKey: {
      label: 'Service Account Key',
      type: 'secret',
      required: true,
    },
  },
  'azure-blob': {
    containerName: { label: 'Container Name', type: 'string', required: true },
    accountName: { label: 'Account Name', type: 'string', required: true },
    accountKey: { label: 'Account Key', type: 'secret', required: true },
  },
};
