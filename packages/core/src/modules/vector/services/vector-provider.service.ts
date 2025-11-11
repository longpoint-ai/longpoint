import { ConfigSchemaService, PrismaService } from '@/modules/common/services';
import { ConfigValues } from '@longpoint/config-schema';
import {
  PluginConfig,
  VectorPluginManifest,
  VectorProviderPlugin,
  VectorProviderPluginArgs,
} from '@longpoint/devkit';
import { findNodeModulesPath } from '@longpoint/utils/path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readdir } from 'fs/promises';
import { createRequire } from 'module';
import { join } from 'path';
import { BaseVectorProviderEntity } from '../entities/base-vector-provider.entity';
import { VectorProviderEntity } from '../entities/vector-provider.entity';
import { VectorProviderNotFound } from '../vector.errors';

interface ProviderPluginRegistryEntry {
  VectorProviderClass: new (
    args: VectorProviderPluginArgs
  ) => VectorProviderPlugin;
  manifest: VectorPluginManifest;
}

@Injectable()
export class VectorProviderService implements OnModuleInit {
  private readonly logger = new Logger(VectorProviderService.name);
  private readonly providerPluginRegistry = new Map<
    string,
    ProviderPluginRegistryEntry
  >();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configSchemaService: ConfigSchemaService
  ) {}

  async onModuleInit() {
    await this.buildProviderRegistry();
  }

  /**
   * List all installed vector providers.
   * @returns A list of base vector provider entities.
   */
  async listProviders() {
    return Array.from(this.providerPluginRegistry.values()).map((regEntry) => {
      return new BaseVectorProviderEntity({
        id: regEntry.manifest.id,
        name: regEntry.manifest.name,
        image: regEntry.manifest.image,
        configSchema: regEntry.manifest.configSchema,
        configSchemaService: this.configSchemaService,
      });
    });
  }

  async getProviderById(id: string) {
    const pluginRegistryEntry = this.providerPluginRegistry.get(id);
    if (!pluginRegistryEntry) {
      return null;
    }

    const configFromDb =
      await this.prismaService.vectorProviderConfig.findUnique({
        where: {
          providerId: id,
        },
        select: {
          config: true,
        },
      });

    const configValuesFromDb = (configFromDb?.config ?? {}) as ConfigValues;
    const configValues = await this.configSchemaService
      .get(pluginRegistryEntry.manifest.configSchema)
      .processOutboundValues(configValuesFromDb);

    return new VectorProviderEntity({
      plugin: new pluginRegistryEntry.VectorProviderClass({
        configValues: configValues,
        manifest: pluginRegistryEntry.manifest,
      }),
      configSchemaService: this.configSchemaService,
    });
  }

  async getProviderByIdOrThrow(id: string) {
    const provider = await this.getProviderById(id);
    if (!provider) {
      throw new VectorProviderNotFound(id);
    }
    return provider;
  }

  private async buildProviderRegistry() {
    const modulesPath = findNodeModulesPath(process.cwd());
    if (!modulesPath) return;

    const modules = await readdir(modulesPath);
    const packageNames = modules.filter((module) =>
      module.startsWith('longpoint-vector-')
    );

    for (const packageName of packageNames) {
      const packagePath = join(modulesPath, packageName);
      const require = createRequire(__filename);
      const pluginConfig: PluginConfig = require(join(
        packagePath,
        'dist',
        'index.js'
      )).default;

      if (pluginConfig.type !== 'vector') continue;
      if (!pluginConfig.provider) {
        this.logger.error(
          `Vector plugin ${packageName} has an invalid provider class`
        );
        continue;
      }
      if (!pluginConfig.manifest) {
        this.logger.error(
          `Vector plugin ${packageName} has an invalid manifest`
        );
        continue;
      }

      this.providerPluginRegistry.set(pluginConfig.manifest.id, {
        VectorProviderClass: pluginConfig.provider,
        manifest: pluginConfig.manifest,
      });
    }
  }
}
