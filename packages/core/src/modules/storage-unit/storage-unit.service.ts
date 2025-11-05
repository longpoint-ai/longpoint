import { ConfigValues } from '@longpoint/devkit';
import {
  NativeStorageProvider,
  STORAGE_PROVIDER_CONFIG_SCHEMAS,
} from '@longpoint/types';
import { Injectable } from '@nestjs/common';
import type { SelectedStorageUnit } from '../../shared/selectors/storage-unit.selectors';
import { selectStorageUnit } from '../../shared/selectors/storage-unit.selectors';
import { ConfigService } from '../common/services/config/config.service';
import { EncryptionService } from '../common/services/encryption/encryption.service';
import { PrismaService } from '../common/services/prisma/prisma.service';
import { CreateStorageUnitDto } from './dtos/create-storage-unit.dto';
import { StorageUnitEntity } from './entities/storage-unit.entity';
import {
  isCoreProvider,
  type CoreStorageProvider,
} from './providers/constants/storage-provider.constants';
import { LocalStorageProvider } from './providers/local.storage-provider';
import { StorageUnitNotFound } from './storage-unit.errors';
import {
  isLocalStorageConfig,
  type BaseStorageProviderConfig,
  type LocalStorageProviderConfig,
} from './types/storage-provider-config.types';
import { StorageProvider } from './types/storage-provider.types';

/**
 * StorageUnitService handles instantiation and caching of storage unit entities
 * based on storage units. Supports core providers (local, s3, gcs, azure-blob).
 * Caches StorageUnitEntity instances which encapsulate both the storage unit data
 * and the instantiated provider.
 */
@Injectable()
export class StorageUnitService {
  private readonly entityCache = new Map<string, StorageUnitEntity>();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Get or create the default storage unit entity.
   * If no default unit exists, creates a local storage unit with default configuration.
   *
   * @returns The default storage unit entity
   */
  async getOrCreateDefaultStorageUnit(): Promise<StorageUnitEntity> {
    const defaultUnit = await this.prismaService.storageUnit.findFirst({
      where: {
        isDefault: true,
      },
      select: selectStorageUnit(),
    });

    if (!defaultUnit) {
      const created = await this.createDefaultStorageUnit();
      return this.getEntityByStorageUnit(created);
    }

    return this.getEntityByStorageUnit(defaultUnit);
  }

  /**
   * Get a storage unit entity by ID.
   * If no storage unit ID is provided, returns the default entity.
   *
   * @param storageUnitId - The storage unit id
   * @returns The storage unit entity
   */
  async getStorageUnitById(
    storageUnitId: string | null
  ): Promise<StorageUnitEntity> {
    if (!storageUnitId) {
      return this.getOrCreateDefaultStorageUnit();
    }

    const cachedEntity = this.entityCache.get(storageUnitId);
    if (cachedEntity) {
      return cachedEntity;
    }

    const storageUnit = await this.prismaService.storageUnit.findUnique({
      where: {
        id: storageUnitId,
      },
      select: selectStorageUnit(),
    });

    if (!storageUnit) {
      throw new Error(`Storage unit with id ${storageUnitId} not found`);
    }

    return this.getEntityByStorageUnit(storageUnit);
  }

  /**
   * Get the storage unit entity for a media container.
   *
   * @param containerId - The media container id
   * @returns The storage unit entity for the container
   */
  async getStorageUnitByContainerId(
    containerId: string
  ): Promise<StorageUnitEntity> {
    const container = await this.prismaService.mediaContainer.findUnique({
      where: {
        id: containerId,
      },
      select: {
        storageUnitId: true,
      },
    });

    if (!container) {
      throw new Error(`Media container with id ${containerId} not found`);
    }

    return this.getStorageUnitById(container.storageUnitId);
  }

  /**
   * Manually evict a storage unit entity from the cache.
   * @param storageUnitId - The storage unit id
   */
  evictCache(storageUnitId: string) {
    this.entityCache.delete(storageUnitId);
  }

  /**
   * Get a storage unit entity for a storage unit.
   * Caches the entity (which includes the provider) for performance.
   */
  private async getEntityByStorageUnit(
    storageUnit: SelectedStorageUnit
  ): Promise<StorageUnitEntity> {
    const cachedEntity = this.entityCache.get(storageUnit.id);
    if (cachedEntity) {
      return cachedEntity;
    }

    const provider = await this.instantiateProvider(storageUnit);
    const entity = new StorageUnitEntity({
      storageUnit,
      provider,
      prismaService: this.prismaService,
      encryptionService: this.encryptionService,
      storageUnitService: this,
    });
    this.entityCache.set(storageUnit.id, entity);
    return entity;
  }

  /**
   * Instantiate a storage provider based on the storage unit's provider type.
   * Supports core providers and is designed to support plugin providers in the future.
   */
  private async instantiateProvider(
    storageUnit: SelectedStorageUnit
  ): Promise<StorageProvider> {
    const { provider } = storageUnit;

    if (isCoreProvider(provider)) {
      return this.instantiateCoreProvider(storageUnit);
    }

    // Future plugin support:
    // const pluginProvider = this.pluginRegistry.get(provider);
    // if (pluginProvider) {
    //   return pluginProvider.instantiate(storageUnit);
    // }

    throw new Error(`Unsupported storage provider: ${provider}`);
  }

  /**
   * Instantiate a core storage provider.
   */
  private async instantiateCoreProvider(
    storageUnit: SelectedStorageUnit
  ): Promise<StorageProvider> {
    switch (storageUnit.provider as CoreStorageProvider) {
      case 'local':
        return this.instantiateLocalProvider(storageUnit);
      case 's3':
        // TODO: Implement S3StorageProvider
        throw new Error('S3 storage provider not yet implemented');
      case 'gcs':
        // TODO: Implement GcsStorageProvider
        throw new Error('GCS storage provider not yet implemented');
      case 'azure-blob':
        // TODO: Implement AzureBlobStorageProvider
        throw new Error('Azure Blob storage provider not yet implemented');
      default:
        throw new Error(
          `Unknown core storage provider: ${storageUnit.provider}`
        );
    }
  }

  /**
   * Instantiate a local storage provider.
   */
  private async instantiateLocalProvider(
    storageUnit: SelectedStorageUnit
  ): Promise<StorageProvider> {
    const config = this.getDecryptedConfig<LocalStorageProviderConfig>(
      storageUnit,
      'local'
    );

    if (!isLocalStorageConfig(config)) {
      throw new Error(
        `Invalid local storage config for storage unit ${storageUnit.id}`
      );
    }

    const basePath = this.configService.get('storage.localBasePath');
    const baseUrl = this.configService.get('server.origin');

    // Use storage unit's basePath as subdirectory, or use storage unit ID
    const unitBasePath = config.basePath || storageUnit.id;

    return new LocalStorageProvider({
      basePath: basePath,
      baseUrl: baseUrl,
      storageUnitId: storageUnit.id,
      unitBasePath: unitBasePath,
    });
  }

  /**
   * Create a default local storage unit if none exists.
   */
  private async createDefaultStorageUnit(): Promise<SelectedStorageUnit> {
    const config: LocalStorageProviderConfig = {
      basePath: 'default',
    };

    // Encrypt config (though local has no secrets, keeping consistent pattern)
    const encryptedConfig = this.encryptionService.encryptConfigValues(
      config,
      STORAGE_PROVIDER_CONFIG_SCHEMAS.local
    );

    const storageUnit = await this.prismaService.storageUnit.create({
      data: {
        name: 'Local Default',
        provider: 'local',
        isDefault: true,
        config: encryptedConfig,
      },
      select: selectStorageUnit(),
    });

    return storageUnit;
  }

  /**
   * Get and decrypt configuration for a storage unit.
   */
  private getDecryptedConfig<T extends BaseStorageProviderConfig>(
    storageUnit: SelectedStorageUnit,
    provider: string
  ): T {
    if (!storageUnit.config) {
      throw new Error(`Storage unit ${storageUnit.id} has no configuration`);
    }

    const schema =
      STORAGE_PROVIDER_CONFIG_SCHEMAS[provider as NativeStorageProvider];
    if (!schema) {
      throw new Error(`Unsupported storage provider: ${provider}`);
    }

    try {
      return this.encryptionService.decryptConfigValues(
        storageUnit.config as ConfigValues,
        schema
      ) as T;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Failed to decrypt data')
      ) {
        // If decryption fails, return config as-is (might be unencrypted or from plugin)
        return storageUnit.config as T;
      }
      throw error;
    }
  }

  /**
   * Creates a new storage unit.
   * @param data - The storage unit data
   * @returns The created storage unit entity
   */
  async createStorageUnit(
    data: CreateStorageUnitDto
  ): Promise<StorageUnitEntity> {
    // If isDefault is being set to true, ensure no other storage unit is default
    if (data.isDefault === true) {
      await this.ensureSingleDefault();
    }

    // Encrypt config if provided
    let encryptedConfig: any = null;
    if (data.config !== undefined) {
      const schema =
        STORAGE_PROVIDER_CONFIG_SCHEMAS[data.provider as NativeStorageProvider];
      if (schema) {
        encryptedConfig = this.encryptionService.encryptConfigValues(
          data.config,
          schema
        );
      } else {
        encryptedConfig = data.config;
      }
    }

    const storageUnit = await this.prismaService.storageUnit.create({
      data: {
        name: data.name,
        provider: data.provider,
        isDefault: data.isDefault ?? false,
        config: encryptedConfig,
      },
      select: selectStorageUnit(),
    });

    return this.getEntityByStorageUnit(storageUnit);
  }

  /**
   * Lists all storage units.
   * @returns Array of storage unit entities
   */
  async listStorageUnits(): Promise<StorageUnitEntity[]> {
    const storageUnits = await this.prismaService.storageUnit.findMany({
      select: selectStorageUnit(),
      orderBy: {
        createdAt: 'asc',
      },
    });

    return Promise.all(
      storageUnits.map((unit) => this.getEntityByStorageUnit(unit))
    );
  }

  /**
   * Gets a storage unit by ID or throws an error if not found.
   * @param id - The storage unit ID
   * @returns The storage unit entity
   * @throws {StorageUnitNotFound} If the storage unit doesn't exist
   */
  async getStorageUnitByIdOrThrow(id: string): Promise<StorageUnitEntity> {
    const storageUnit = await this.prismaService.storageUnit.findUnique({
      where: { id },
      select: selectStorageUnit(),
    });

    if (!storageUnit) {
      throw new StorageUnitNotFound(id);
    }

    return this.getEntityByStorageUnit(storageUnit);
  }

  /**
   * Ensures only one storage unit is marked as default.
   * If multiple exist, keeps the first one and sets others to false.
   * @param excludeId - Optional ID to exclude from being set to non-default (e.g., the one being set to default)
   */
  async ensureSingleDefault(excludeId?: string): Promise<void> {
    const defaultUnit = await this.prismaService.storageUnit.findFirst({
      where: { isDefault: true },
      orderBy: { createdAt: 'asc' },
    });

    if (defaultUnit) {
      const whereClause: any = {
        isDefault: true,
      };

      // If excludeId is provided, don't update that one
      if (excludeId) {
        whereClause.id = { not: excludeId };
      } else {
        whereClause.id = { not: defaultUnit.id };
      }

      await this.prismaService.storageUnit.updateMany({
        where: whereClause,
        data: {
          isDefault: false,
        },
      });
    }
  }
}
