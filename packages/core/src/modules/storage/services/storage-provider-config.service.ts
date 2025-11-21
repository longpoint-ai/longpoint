import { Prisma } from '@/database';
import { ConfigValues } from '@longpoint/config-schema';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma/prisma.service';
import { CreateStorageConfigDto, UpdateStorageConfigDto } from '../dtos';
import { StorageProviderConfigEntity } from '../entities/storage-provider-config.entity';
import {
  StorageProviderConfigNotFound,
  StorageProviderNotFound,
} from '../storage.errors';
import {
  SelectedStorageProviderConfig,
  selectStorageProviderConfig,
} from '../storage.selectors';
import { StorageProviderService } from './storage-provider.service';

/**
 * StorageProviderConfigService handles instantiation and caching of storage provider config entities.
 * Supports creating, listing, updating, and deleting storage provider configs.
 */
@Injectable()
export class StorageProviderConfigService {
  private readonly entityCache = new Map<string, StorageProviderConfigEntity>();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageProviderService: StorageProviderService
  ) {}

  /**
   * Creates a new storage provider config.
   * @param data - The config data
   * @returns The created config entity
   */
  async createConfig(
    data: CreateStorageConfigDto
  ): Promise<StorageProviderConfigEntity> {
    // Verify provider exists
    const providers = await this.storageProviderService.listProviders();
    const providerExists = providers.some((p) => p.id === data.providerId);
    if (!providerExists) {
      throw new StorageProviderNotFound(data.providerId);
    }

    let inboundConfig: ConfigValues | null = null;
    if (data.config !== undefined) {
      inboundConfig = await this.storageProviderService.processConfigForDb(
        data.providerId,
        data.config
      );
    }

    const config = await this.prismaService.storageProviderConfig.create({
      data: {
        name: data.name,
        provider: data.providerId,
        config: inboundConfig ?? Prisma.JsonNull,
      },
      select: selectStorageProviderConfig(),
    });

    return this.getEntityByConfig({
      id: config.id,
      name: config.name,
      provider: config.provider,
      config: config.config,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    });
  }

  /**
   * Lists all storage provider configs.
   * @param providerId - Optional provider ID to filter by
   * @returns Array of config entities
   */
  async listConfigs(
    providerId?: string
  ): Promise<StorageProviderConfigEntity[]> {
    const where = providerId ? { provider: providerId } : {};
    const configs = await this.prismaService.storageProviderConfig.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
    });

    return Promise.all(
      configs.map((config) =>
        this.getEntityByConfig({
          id: config.id,
          name: config.name,
          provider: config.provider,
          config: config.config,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt,
        })
      )
    );
  }

  /**
   * Gets a storage provider config by ID.
   * @param id - The config ID
   * @returns The config entity or null if not found
   */
  async getConfigById(id: string): Promise<StorageProviderConfigEntity | null> {
    const cachedEntity = this.entityCache.get(id);
    if (cachedEntity) {
      return cachedEntity;
    }

    const config = await this.prismaService.storageProviderConfig.findUnique({
      where: { id },
    });

    if (!config) {
      return null;
    }

    return this.getEntityByConfig({
      id: config.id,
      name: config.name,
      provider: config.provider,
      config: config.config,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    });
  }

  /**
   * Gets a storage provider config by ID or throws an error if not found.
   * @param id - The config ID
   * @returns The config entity
   * @throws {StorageProviderConfigNotFound} If the config doesn't exist
   */
  async getConfigByIdOrThrow(id: string): Promise<StorageProviderConfigEntity> {
    const config = await this.getConfigById(id);
    if (!config) {
      throw new StorageProviderConfigNotFound(id);
    }
    return config;
  }

  /**
   * Updates a storage provider config.
   * @param id - The config ID
   * @param data - The update data
   * @returns The updated config entity
   */
  async updateConfig(
    id: string,
    data: UpdateStorageConfigDto
  ): Promise<StorageProviderConfigEntity> {
    const entity = await this.getConfigByIdOrThrow(id);

    await entity.update(data);

    // Return fresh entity
    return this.getConfigByIdOrThrow(id);
  }

  /**
   * Deletes a storage provider config.
   * @param id - The config ID
   * @throws {StorageProviderConfigInUse} If the config is in use
   */
  async deleteConfig(id: string): Promise<void> {
    const entity = await this.getConfigByIdOrThrow(id);
    await entity.delete();
  }

  /**
   * Gets all configs for a specific provider.
   * @param providerId - The provider ID
   * @returns Array of config entities
   */
  async getConfigsByProvider(
    providerId: string
  ): Promise<StorageProviderConfigEntity[]> {
    return this.listConfigs(providerId);
  }

  /**
   * Manually evict a config entity from the cache.
   * @param id - The config ID
   */
  evictCache(id: string) {
    this.entityCache.delete(id);
  }

  /**
   * Get a config entity from a database record.
   * @param config - The database record
   * @returns The config entity
   */
  private async getEntityByConfig(
    config: SelectedStorageProviderConfig
  ): Promise<StorageProviderConfigEntity> {
    const cachedEntity = this.entityCache.get(config.id);

    if (cachedEntity) {
      return cachedEntity;
    }

    const provider = await this.storageProviderService.getProviderByIdOrThrow(
      config.provider,
      (config.config as ConfigValues) ?? {}
    );

    const entity = new StorageProviderConfigEntity({
      id: config.id,
      name: config.name,
      provider,
      configFromDb: config.config as ConfigValues | null,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      prismaService: this.prismaService,
      storageProviderConfigService: this,
      storageProviderService: this.storageProviderService,
    });

    this.entityCache.set(config.id, entity);

    return entity;
  }
}
