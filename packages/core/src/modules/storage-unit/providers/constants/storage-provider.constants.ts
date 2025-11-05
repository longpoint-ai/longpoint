/**
 * Array of core storage provider identifiers
 */
export const CORE_STORAGE_PROVIDERS = [
  'local',
  's3',
  'gcs',
  'azure-blob',
] as const;

/**
 * Core storage providers that are built into the system
 */
export type CoreStorageProvider = (typeof CORE_STORAGE_PROVIDERS)[number];

/**
 * Type guard to check if a provider string is a core provider
 */
export function isCoreProvider(
  provider: string
): provider is CoreStorageProvider {
  return CORE_STORAGE_PROVIDERS.includes(provider as CoreStorageProvider);
}
