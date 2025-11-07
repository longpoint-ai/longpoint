import { ConfigValues } from '@longpoint/config-schema';
import { Logger } from '@nestjs/common';
import { selectStorageUnit } from '../../../shared/selectors/storage-unit.selectors';
import { PrismaService } from '../../common/services/prisma/prisma.service';
import { StorageUnitSummaryDto } from '../dtos/storage-unit-summary.dto';
import { StorageUnitDto } from '../dtos/storage-unit.dto';
import { UpdateStorageUnitDto } from '../dtos/update-storage-unit.dto';
import { StorageProviderService } from '../services/storage-provider.service';
import { StorageUnitService } from '../services/storage-unit.service';
import {
  CannotDeleteDefaultStorageUnit,
  StorageUnitInUse,
  StorageUnitNotFound,
} from '../storage-unit.errors';
import { StorageProviderEntity } from './storage-provider.entity';

export interface StorageUnitEntityArgs {
  id: string;
  name: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  configFromDb: ConfigValues | null;
  providerId: string;
  prismaService: PrismaService;
  storageUnitService: StorageUnitService;
  storageProviderService: StorageProviderService;
}

/**
 * Entity representing a storage unit with its instantiated provider.
 * Encapsulates the storage unit data and its provider instance.
 */
export class StorageUnitEntity {
  readonly id: string;
  readonly createdAt: Date;
  private _name: string;
  private _isDefault: boolean;
  private _updatedAt: Date;
  private provider: StorageProviderEntity | null = null;
  private configFromDb: ConfigValues | null;
  private readonly providerId: string;

  private readonly prismaService: PrismaService;
  private readonly storageUnitService: StorageUnitService;
  private readonly storageProviderService: StorageProviderService;
  private readonly logger = new Logger(StorageUnitEntity.name);

  constructor(args: StorageUnitEntityArgs) {
    this.id = args.id;
    this._name = args.name ?? args.id;
    this.createdAt = args.createdAt;
    this._updatedAt = args.updatedAt;
    this.configFromDb = args.configFromDb;
    this.providerId = args.providerId;
    this._isDefault = args.isDefault;
    this.prismaService = args.prismaService;
    this.storageUnitService = args.storageUnitService;
    this.storageProviderService = args.storageProviderService;
  }

  /**
   * Updates the storage unit.
   * @param data - The update data (config should be in decrypted form)
   */
  async update(data: UpdateStorageUnitDto): Promise<void> {
    try {
      if (data.isDefault === true) {
        await this.storageUnitService.ensureSingleDefault(this.id);
      }

      let configForDb: ConfigValues | null = null;
      if (data.config !== undefined) {
        const provider = await this.getProvider();
        configForDb = await provider.processConfig(data.config);
      }

      const updateData: {
        name?: string;
        isDefault?: boolean;
        config?: ConfigValues;
      } = {};

      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      if (data.isDefault !== undefined) {
        updateData.isDefault = data.isDefault;
      }
      if (configForDb) {
        updateData.config = configForDb;
      }

      const updated = await this.prismaService.storageUnit.update({
        where: { id: this.id },
        data: updateData,
        select: selectStorageUnit(),
      });

      this._name = updated.name;
      this._isDefault = updated.isDefault;
      this.configFromDb = updateData.config ?? null;
      this._updatedAt = updated.updatedAt;

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
   * Get the underlying storage provider for this storage unit.
   * @returns The storage provider entity.
   */
  async getProvider(): Promise<StorageProviderEntity> {
    if (this.provider) {
      return this.provider;
    }

    this.provider = await this.storageProviderService.getProviderByIdOrThrow(
      this.providerId,
      this.configFromDb ?? {}
    );

    return this.provider;
  }

  async toDto(): Promise<StorageUnitDto> {
    const provider = await this.getProvider();
    return new StorageUnitDto({
      id: this.id,
      name: this._name,
      provider: provider.toDto(),
      isDefault: this._isDefault,
      config: await provider.processConfigFromDb(this.configFromDb ?? {}),
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    });
  }

  async toSummaryDto(): Promise<StorageUnitSummaryDto> {
    const provider = await this.getProvider();
    return new StorageUnitSummaryDto({
      id: this.id,
      name: this._name,
      provider: provider.toShortDto(),
      isDefault: this._isDefault,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    });
  }

  /**
   * Evicts this entity from the cache.
   * Called internally after updates/deletes.
   */
  private evictFromCache(): void {
    this.storageUnitService.evictCache(this.id);
  }

  get name(): string {
    return this._name;
  }

  get isDefault(): boolean {
    return this._isDefault;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
