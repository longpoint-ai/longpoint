import {
  ConfigSchemaService,
  ConfigService,
  PrismaService,
} from '@/modules/common/services';
import { ConfigValues } from '@longpoint/config-schema';
import {
  PluginConfig,
  StoragePluginManifest,
  StorageProviderPlugin,
  StorageProviderPluginArgs,
} from '@longpoint/devkit';
import { findNodeModulesPath } from '@longpoint/utils/path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readdir } from 'fs/promises';
import { createRequire } from 'module';
import { join } from 'path';
import { StorageProviderEntity } from '../entities';
import { BaseStorageProviderEntity } from '../entities/base-storage-provider.entity';
import { StorageProviderNotFound } from '../storage-unit.errors';

interface ProviderPluginRegistryEntry {
  StorageProviderClass: new (
    args: StorageProviderPluginArgs
  ) => StorageProviderPlugin;
  manifest: StoragePluginManifest;
}

@Injectable()
export class StorageProviderService implements OnModuleInit {
  private readonly logger = new Logger(StorageProviderService.name);
  private readonly providerPluginRegistry = new Map<
    string,
    ProviderPluginRegistryEntry
  >();

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly configSchemaService: ConfigSchemaService
  ) {}

  async onModuleInit() {
    await this.buildProviderRegistry();
  }

  /**
   * List all installed storage providers.
   * @returns A list of base storage provider entities.
   */
  async listProviders() {
    return Array.from(this.providerPluginRegistry.values()).map((regEntry) => {
      return new BaseStorageProviderEntity({
        configSchemaService: this.configSchemaService,
        id: regEntry.manifest.id,
        name: regEntry.manifest.name,
        image: regEntry.manifest.image,
        configSchema: regEntry.manifest.configSchema,
      });
    });
  }

  async getProviderById(
    id: string,
    configFromDb: ConfigValues
  ): Promise<StorageProviderEntity | null> {
    const pluginRegistryEntry = this.providerPluginRegistry.get(id);

    if (!pluginRegistryEntry) {
      return null;
    }

    const schemaObj = pluginRegistryEntry.manifest.configSchema;
    const configForUse = await this.configSchemaService
      .get(schemaObj)
      .processOutboundValues(configFromDb);

    return new StorageProviderEntity({
      configSchemaService: this.configSchemaService,
      storageProviderPlugin: new pluginRegistryEntry.StorageProviderClass({
        baseUrl: this.configService.get('server.origin'),
        configValues: configForUse,
        manifest: pluginRegistryEntry.manifest,
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
    const pluginRegistryEntry = this.providerPluginRegistry.get(providerId);
    if (!pluginRegistryEntry) {
      throw new StorageProviderNotFound(providerId);
    }
    return await this.configSchemaService
      .get(pluginRegistryEntry.manifest.configSchema)
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

  private async buildProviderRegistry() {
    const modulesPath = findNodeModulesPath(process.cwd());
    if (!modulesPath) return;

    const modules = await readdir(modulesPath);
    const packageNames = modules.filter((module) =>
      module.startsWith('longpoint-storage-')
    );

    for (const packageName of packageNames) {
      const packagePath = join(modulesPath, packageName);
      const require = createRequire(__filename);
      const pluginConfig: PluginConfig = require(join(
        packagePath,
        'dist',
        'index.js'
      )).default;

      if (pluginConfig.type !== 'storage') continue;
      if (!pluginConfig.provider) {
        this.logger.error(
          `Storage plugin ${packageName} has an invalid provider class`
        );
        continue;
      }
      if (!pluginConfig.manifest) {
        this.logger.error(
          `Storage plugin ${packageName} has an invalid manifest`
        );
        continue;
      }

      this.providerPluginRegistry.set(pluginConfig.manifest.id, {
        StorageProviderClass: pluginConfig.provider,
        manifest: pluginConfig.manifest,
      });
    }
  }
}
