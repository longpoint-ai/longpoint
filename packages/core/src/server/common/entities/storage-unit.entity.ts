import type { SelectedStorageUnit } from '../selectors/storage-unit.selectors';
import { StorageProvider } from '../types/storage-provider.types';

export interface StorageUnitEntityArgs {
  storageUnit: SelectedStorageUnit;
  provider: StorageProvider;
}

/**
 * Entity representing a storage unit with its instantiated provider.
 * Encapsulates the storage unit data and its provider instance.
 */
export class StorageUnitEntity {
  readonly id: string;
  readonly name: string;
  readonly isDefault: boolean;
  readonly config: unknown;
  readonly provider: StorageProvider;

  constructor(args: StorageUnitEntityArgs) {
    this.id = args.storageUnit.id;
    this.name = args.storageUnit.name;
    this.isDefault = args.storageUnit.isDefault;
    this.config = args.storageUnit.config;
    this.provider = args.provider;
  }

  /**
   * Test the connection to the storage provider.
   * This is a placeholder for future implementation - providers may implement testConnection()
   */
  async testConnection(): Promise<{
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    healthy: boolean;
  }> {
    // TODO: Implement testConnection for providers
    // For now, try to read a test path to verify connection
    try {
      const testPath = `/.test-${Date.now()}`;
      await this.provider.exists(testPath);
      return {
        canRead: true,
        canWrite: true,
        canDelete: true,
        healthy: true,
      };
    } catch {
      return {
        canRead: false,
        canWrite: false,
        canDelete: false,
        healthy: false,
      };
    }
  }
}
