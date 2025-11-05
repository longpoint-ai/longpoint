import { ConfigValues } from '@longpoint/devkit';
import type { SelectedStorageUnit } from '../../../shared/selectors/storage-unit.selectors';
import { selectStorageUnit } from '../../../shared/selectors/storage-unit.selectors';
import { EncryptionService } from '../../common/services/encryption/encryption.service';
import { PrismaService } from '../../common/services/prisma/prisma.service';
import { StorageUnitSummaryDto } from '../dtos/storage-unit-summary.dto';
import { StorageUnitDto } from '../dtos/storage-unit.dto';
import { UpdateStorageUnitDto } from '../dtos/update-storage-unit.dto';
import {
  CannotDeleteDefaultStorageUnit,
  StorageUnitInUse,
  StorageUnitNotFound,
} from '../storage-unit.errors';
import { StorageUnitService } from '../storage-unit.service';
import { STORAGE_PROVIDER_CONFIG_SCHEMAS } from '../types/storage-provider-config.types';
import { StorageProvider } from '../types/storage-provider.types';

export interface StorageUnitEntityArgs {
  storageUnit: SelectedStorageUnit;
  provider: StorageProvider;
  prismaService: PrismaService;
  encryptionService: EncryptionService;
  storageUnitService: StorageUnitService;
}

/**
 * Entity representing a storage unit with its instantiated provider.
 * Encapsulates the storage unit data and its provider instance.
 *
 * Note: The config stored in this entity is ENCRYPTED. Use toDto() to get
 * the decrypted version for API responses.
 */
export class StorageUnitEntity {
  readonly id: string;
  readonly providerType: string;
  readonly provider: StorageProvider;
  private _name: string;
  private _isDefault: boolean;
  /**
   * Encrypted configuration (as stored in database)
   * Use getDecryptedConfig() or toDto() to access decrypted values
   */
  private readonly encryptedConfig: unknown;
  private readonly prismaService: PrismaService;
  private readonly encryptionService: EncryptionService;
  private readonly storageUnitService: StorageUnitService;

  constructor(args: StorageUnitEntityArgs) {
    this.id = args.storageUnit.id;
    this._name = args.storageUnit.name;
    this.providerType = args.storageUnit.provider;
    this._isDefault = args.storageUnit.isDefault;
    this.encryptedConfig = args.storageUnit.config;
    this.provider = args.provider;
    this.prismaService = args.prismaService;
    this.encryptionService = args.encryptionService;
    this.storageUnitService = args.storageUnitService;
  }

  get name(): string {
    return this._name;
  }

  get isDefault(): boolean {
    return this._isDefault;
  }

  /**
   * Gets the encrypted configuration (as stored in database).
   * For decrypted config, use getDecryptedConfig() or toDto().
   */
  get config(): unknown {
    return this.encryptedConfig;
  }

  /**
   * Evicts this entity from the cache.
   * Called internally after updates/deletes.
   */
  private evictFromCache(): void {
    this.storageUnitService.evictCache(this.id);
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

  /**
   * Updates the storage unit.
   * @param data - The update data (config should be in decrypted form)
   */
  async update(data: UpdateStorageUnitDto): Promise<void> {
    try {
      // If isDefault is being set to true, ensure no other storage unit is default
      if (data.isDefault === true) {
        await this.storageUnitService.ensureSingleDefault(this.id);
      }

      // Encrypt config if provided (data.config is expected to be decrypted)
      let encryptedConfig: unknown = undefined;
      if (data.config !== undefined) {
        const schema = STORAGE_PROVIDER_CONFIG_SCHEMAS[this.providerType];
        if (schema) {
          encryptedConfig = this.encryptionService.encryptConfigValues(
            data.config,
            schema
          );
        } else {
          encryptedConfig = data.config;
        }
      }

      const updateData: {
        name?: string;
        isDefault?: boolean;
        config?: any;
      } = {};

      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      if (data.isDefault !== undefined) {
        updateData.isDefault = data.isDefault;
      }
      if (data.config !== undefined) {
        updateData.config = encryptedConfig as any;
      }

      const updated = await this.prismaService.storageUnit.update({
        where: { id: this.id },
        data: updateData,
        select: selectStorageUnit(),
      });

      this._name = updated.name;
      this._isDefault = updated.isDefault;
      // Note: updated.config is encrypted

      // Evict from cache so the entity is recreated with updated data
      this.evictFromCache();
    } catch (e) {
      if (PrismaService.isNotFoundError(e)) {
        throw new StorageUnitNotFound(this.id);
      }
      throw e;
    }
  }

  /**
   * Deletes the storage unit.
   * @throws {StorageUnitInUse} If the storage unit has media containers
   * @throws {CannotDeleteDefaultStorageUnit} If trying to delete the last default storage unit
   */
  async delete(): Promise<void> {
    const containerCount = await this.prismaService.mediaContainer.count({
      where: {
        storageUnitId: this.id,
      },
    });

    if (containerCount > 0) {
      throw new StorageUnitInUse(this.id);
    }

    if (this._isDefault) {
      const defaultCount = await this.prismaService.storageUnit.count({
        where: {
          isDefault: true,
        },
      });

      if (defaultCount <= 1) {
        throw new CannotDeleteDefaultStorageUnit(this.id);
      }
    }

    try {
      await this.prismaService.storageUnit.delete({
        where: { id: this.id },
      });

      this.evictFromCache();
    } catch (e) {
      if (PrismaService.isNotFoundError(e)) {
        throw new StorageUnitNotFound(this.id);
      }
      throw e;
    }
  }

  /**
   * Converts the entity to a DTO.
   */
  async toDto(): Promise<StorageUnitDto> {
    const storageUnit = await this.prismaService.storageUnit.findUnique({
      where: { id: this.id },
      select: {
        ...selectStorageUnit(),
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!storageUnit) {
      throw new StorageUnitNotFound(this.id);
    }

    // Decrypt config
    let decryptedConfig: ConfigValues | null = null;
    if (storageUnit.config) {
      const schema = STORAGE_PROVIDER_CONFIG_SCHEMAS[this.providerType];
      if (schema) {
        try {
          decryptedConfig = this.encryptionService.decryptConfigValues(
            storageUnit.config as ConfigValues,
            schema
          );
        } catch (error) {
          // If decryption fails, return config as-is (might be unencrypted or from plugin)
          decryptedConfig = storageUnit.config as ConfigValues;
        }
      } else {
        decryptedConfig = storageUnit.config as ConfigValues;
      }
    }

    return new StorageUnitDto({
      id: storageUnit.id,
      name: storageUnit.name,
      provider: storageUnit.provider,
      isDefault: storageUnit.isDefault,
      config: decryptedConfig,
      createdAt: storageUnit.createdAt,
      updatedAt: storageUnit.updatedAt,
    });
  }

  /**
   * Converts the entity to a summary DTO.
   */
  async toSummaryDto(): Promise<StorageUnitSummaryDto> {
    const storageUnit = await this.prismaService.storageUnit.findUnique({
      where: { id: this.id },
      select: {
        id: true,
        name: true,
        provider: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!storageUnit) {
      throw new StorageUnitNotFound(this.id);
    }

    return new StorageUnitSummaryDto({
      id: storageUnit.id,
      name: storageUnit.name,
      provider: storageUnit.provider,
      isDefault: storageUnit.isDefault,
      createdAt: storageUnit.createdAt,
      updatedAt: storageUnit.updatedAt,
    });
  }
}
