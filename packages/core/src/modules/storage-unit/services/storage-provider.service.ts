import {
  ConfigSchemaService,
  ConfigService,
  PluginRegistryService,
  PrismaService,
} from '@/modules/common/services';
import { ConfigValues } from '@longpoint/config-schema';
import { Injectable } from '@nestjs/common';
import { StorageProviderEntity } from '../entities';
import { BaseStorageProviderEntity } from '../entities/base-storage-provider.entity';
import { StorageProviderNotFound } from '../storage-unit.errors';

@Injectable()
export class StorageProviderService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly configSchemaService: ConfigSchemaService,
    private readonly pluginRegistryService: PluginRegistryService
  ) {}

  /**
   * List all installed storage providers.
   * @returns A list of base storage provider entities.
   */
  async listProviders() {
    const plugins = this.pluginRegistryService.listPlugins('storage');
    return plugins.map((entry) => {
      return new BaseStorageProviderEntity({
        configSchemaService: this.configSchemaService,
        id: entry.derivedId,
        name: entry.manifest.name,
        image: entry.manifest.image,
        configSchema: entry.manifest.configSchema,
      });
    });
  }

  async getProviderById(
    id: string,
    configFromDb: ConfigValues
  ): Promise<StorageProviderEntity | null> {
    // Extract type and name from derived ID (format: 'storage-s3')
    const [type, ...nameParts] = id.split('-');
    if (type !== 'storage') {
      return null;
    }
    const name = nameParts.join('-');

    const registryEntry = this.pluginRegistryService.getPlugin('storage', name);

    if (!registryEntry) {
      return null;
    }

    const StorageProviderClass = registryEntry.provider;
    const schemaObj = registryEntry.manifest.configSchema;
    const configForUse = await this.configSchemaService
      .get(schemaObj)
      .processOutboundValues(configFromDb);

    return new StorageProviderEntity({
      configSchemaService: this.configSchemaService,
      storageProviderPlugin: new StorageProviderClass({
        baseUrl: this.configService.get('server.origin'),
        configValues: configForUse,
        manifest: registryEntry.manifest,
      }),
    });
  }

  async getProviderByIdOrThrow(
    id: string,
    configFromDb: ConfigValues
  ): Promise<StorageProviderEntity> {
    const provider = await this.getProviderById(id, configFromDb);
    if (!provider) {
      throw new StorageProviderNotFound(id);
    }
    return provider;
  }

  async processConfigForDb(providerId: string, configValues: ConfigValues) {
    const [type, ...nameParts] = providerId.split('-');
    if (type !== 'storage') {
      throw new StorageProviderNotFound(providerId);
    }
    const name = nameParts.join('-');
    const registryEntry = this.pluginRegistryService.getPlugin('storage', name);
    if (!registryEntry) {
      throw new StorageProviderNotFound(providerId);
    }
    return await this.configSchemaService
      .get(registryEntry.manifest.configSchema)
      .processInboundValues(configValues);
  }

  async getProviderByStorageUnitId(
    id: string
  ): Promise<StorageProviderEntity | null> {
    const storageUnit = await this.prismaService.storageUnit.findUnique({
      where: { id },
      select: {
        provider: true,
        config: true,
      },
    });

    if (!storageUnit) {
      return null;
    }

    const configValues = storageUnit.config as unknown as ConfigValues;

    return this.getProviderById(storageUnit.provider, configValues);
  }

  async getProviderByStorageUnitIdOrThrow(
    id: string
  ): Promise<StorageProviderEntity> {
    const provider = await this.getProviderByStorageUnitId(id);
    if (!provider) {
      throw new StorageProviderNotFound(id);
    }
    return provider;
  }
}
