import {
  ConfigSchemaService,
  PluginRegistryService,
  PrismaService,
} from '@/modules/common/services';
import { InvalidInput, InvalidProviderConfig } from '@/shared/errors';
import { ConfigValues } from '@longpoint/config-schema';
import {
  VectorPluginManifest,
  VectorProviderPlugin,
  VectorProviderPluginArgs,
} from '@longpoint/devkit';
import { Injectable } from '@nestjs/common';
import { BaseVectorProviderEntity } from '../entities/base-vector-provider.entity';
import { VectorProviderEntity } from '../entities/vector-provider.entity';
import { SearchIndexNotFound, VectorProviderNotFound } from '../search.errors';

interface ProviderPluginRegistryEntry {
  VectorProviderClass: new (
    args: VectorProviderPluginArgs
  ) => VectorProviderPlugin;
  manifest: VectorPluginManifest;
}

@Injectable()
export class VectorProviderService {
  private readonly providerPluginRegistry = new Map<
    string,
    ProviderPluginRegistryEntry
  >();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configSchemaService: ConfigSchemaService,
    private readonly pluginRegistryService: PluginRegistryService
  ) {}

  private buildProviderRegistry() {
    const plugins = this.pluginRegistryService.listPlugins('vector');

    for (const registryEntry of plugins) {
      this.providerPluginRegistry.set(registryEntry.derivedId, {
        VectorProviderClass: registryEntry.provider,
        manifest: registryEntry.manifest,
      });
    }
  }

  private ensureRegistryBuilt() {
    if (this.providerPluginRegistry.size === 0) {
      this.buildProviderRegistry();
    }
  }

  /**
   * List all installed vector providers.
   * @returns A list of base vector provider entities.
   */
  async listProviders() {
    this.ensureRegistryBuilt();
    const regEntries = Array.from(this.providerPluginRegistry.entries());
    const providerConfigs =
      await this.prismaService.vectorProviderConfig.findMany({
        where: {
          providerId: {
            in: regEntries.map(([derivedId]) => derivedId),
          },
        },
        select: {
          providerId: true,
          config: true,
        },
      });
    return Promise.all(
      providerConfigs.map(async ({ providerId, config }) => {
        const regEntry = this.providerPluginRegistry.get(providerId);
        if (!regEntry) {
          throw new VectorProviderNotFound(providerId);
        }
        const providerConfigValues = await this.configSchemaService
          .get(regEntry.manifest.providerConfigSchema)
          .processOutboundValues(config as ConfigValues);
        return new BaseVectorProviderEntity({
          id: providerId, // Use derived ID
          name: regEntry.manifest.name,
          image: regEntry.manifest.image,
          supportsEmbedding: regEntry.manifest.supportsEmbedding ?? false,
          providerConfigSchema: regEntry.manifest.providerConfigSchema,
          providerConfigValues,
          configSchemaService: this.configSchemaService,
          indexConfigSchema: regEntry.manifest.indexConfigSchema,
        });
      })
    );
  }

  async getProviderById(id: string, indexConfigFromDb: ConfigValues) {
    this.ensureRegistryBuilt();
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

    try {
      const providerConfigValues = await this.configSchemaService
        .get(pluginRegistryEntry.manifest.providerConfigSchema)
        .processOutboundValues(configValuesFromDb);
      const indexConfigValues = await this.configSchemaService
        .get(pluginRegistryEntry.manifest.indexConfigSchema)
        .processOutboundValues(indexConfigFromDb);

      return new VectorProviderEntity({
        plugin: new pluginRegistryEntry.VectorProviderClass({
          providerConfigValues,
          indexConfigValues,
          manifest: pluginRegistryEntry.manifest,
        }),
        configSchemaService: this.configSchemaService,
      });
    } catch (e) {
      if (e instanceof InvalidInput) {
        throw new InvalidProviderConfig('vector', id, e.getMessages());
      }
      throw e;
    }
  }

  async getProviderByIdOrThrow(id: string, indexConfigFromDb: ConfigValues) {
    const provider = await this.getProviderById(id, indexConfigFromDb);
    if (!provider) {
      throw new VectorProviderNotFound(id);
    }
    return provider;
  }

  async getProviderBySearchIndexId(indexId: string) {
    const index = await this.prismaService.searchIndex.findUnique({
      where: { id: indexId },
      select: { vectorProviderId: true, config: true },
    });
    if (!index) {
      throw new SearchIndexNotFound(indexId);
    }
    return await this.getProviderById(
      index.vectorProviderId,
      index.config as ConfigValues
    );
  }

  async getProviderBySearchIndexIdOrThrow(indexId: string) {
    const provider = await this.getProviderBySearchIndexId(indexId);
    if (!provider) {
      throw new VectorProviderNotFound(indexId);
    }
    return provider;
  }

  /**
   * Update the configuration values for a provider.
   * @param providerId - The ID of the provider to update.
   * @param configValues - The configuration values to update.
   * @returns A vector provider entity with the updated configuration.
   */
  async updateProviderConfig(providerId: string, configValues: ConfigValues) {
    this.ensureRegistryBuilt();
    const regEntry = this.providerPluginRegistry.get(providerId);
    if (!regEntry) {
      throw new VectorProviderNotFound(providerId);
    }

    const schemaObj = regEntry.manifest.providerConfigSchema;
    if (!schemaObj) {
      throw new InvalidInput('Provider does not support configuration');
    }

    const inboundConfig = await this.configSchemaService
      .get(schemaObj)
      .processInboundValues(configValues);

    await this.prismaService.vectorProviderConfig.upsert({
      where: { providerId },
      update: { config: inboundConfig },
      create: { providerId, config: inboundConfig },
    });

    return await this.getProviderByIdOrThrow(providerId, inboundConfig);
  }

  async processIndexConfigForDb(
    providerId: string,
    configValues: ConfigValues
  ) {
    this.ensureRegistryBuilt();
    const regEntry = this.providerPluginRegistry.get(providerId);
    if (!regEntry) {
      throw new VectorProviderNotFound(providerId);
    }
    return await this.configSchemaService
      .get(regEntry.manifest.indexConfigSchema)
      .processInboundValues(configValues);
  }
}
