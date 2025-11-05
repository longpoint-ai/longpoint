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
 * Type guard to check if config is for local storage
 */
export function isLocalStorageConfig(
  config: BaseStorageProviderConfig
): config is LocalStorageProviderConfig {
  return 'basePath' in config && typeof config.basePath === 'string';
}
