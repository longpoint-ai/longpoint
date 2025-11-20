import {
  ConfigSchemaService,
  PluginRegistryService,
} from '@/modules/common/services';
import { InvalidInput } from '@/shared/errors';
import { ConfigSchemaDefinition, ConfigValues } from '@longpoint/config-schema';
import {
  AiModelManifest,
  AiPluginManifest,
  AiProviderPlugin,
  AiProviderPluginArgs,
} from '@longpoint/devkit';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AiModelEntity } from '../../common/entities';
import { PrismaService } from '../../common/services/prisma/prisma.service';
import { AiProviderNotFound, ModelNotFound } from '../ai.errors';
import { AiProviderEntity } from '../entities/ai-provider.entity';

interface ProviderPluginRegistryEntry {
  instance: AiProviderPlugin;
  ProviderClass: new (
    args: AiProviderPluginArgs<AiPluginManifest>
  ) => AiProviderPlugin;
}

@Injectable()
export class AiPluginService implements OnModuleInit {
  private readonly logger = new Logger(AiPluginService.name);
  private readonly providerPluginRegistry = new Map<
    string,
    ProviderPluginRegistryEntry
  >();
  private readonly modelManifestRegistry = new Map<string, AiModelManifest>();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configSchemaService: ConfigSchemaService,
    private readonly pluginRegistryService: PluginRegistryService
  ) {}

  async onModuleInit() {
    await this.buildProviderRegistry();
  }

  /**
   * List all installed models.
   * @returns A list of ai model entities.
   */
  listModels() {
    return Array.from(this.providerPluginRegistry.values()).flatMap(
      (regEntry) => {
        const models: AiModelEntity[] = [];

        for (const modelManifest of Object.values(
          regEntry.instance.manifest.models
        )) {
          const model = this.getModel(
            `${regEntry.instance.id}/${modelManifest.id}`
          );
          if (model) {
            models.push(model);
          }
        }

        return models;
      }
    );
  }

  /**
   * List all installed providers.
   * @returns A list of ai provider entities.
   */
  listProviders() {
    return Array.from(this.providerPluginRegistry.values()).map((regEntry) => {
      return new AiProviderEntity({
        pluginInstance: regEntry.instance,
        configSchemaService: this.configSchemaService,
      });
    });
  }

  /**
   * Get a model by its fully qualified ID.
   * @param fullyQualifiedId - The fully qualified ID of the model to get.
   * @returns The ai model entity
   */
  getModel(fullyQualifiedId: string): AiModelEntity | null {
    const [providerId, modelId] = fullyQualifiedId.split('/');

    const providerPluginInstance = this.getPluginInstance(providerId);
    if (!providerPluginInstance) {
      return null;
    }

    const providerEntity = this.getProvider(providerId);
    if (!providerEntity) {
      return null;
    }

    const modelManifest = this.modelManifestRegistry.get(
      `${providerId}/${modelId}`
    );
    if (!modelManifest) {
      return null;
    }

    return new AiModelEntity({
      manifest: modelManifest,
      providerPluginInstance,
      providerEntity,
      configSchemaService: this.configSchemaService,
    });
  }

  /**
   * Get a model by its fully qualified ID and throw an error if it is not found.
   * @param fullyQualifiedId - The fully qualified ID of the model to get.
   * @returns The ai model entity.
   * @throws {ModelNotFound} If the model is not found.
   */
  getModelOrThrow(fullyQualifiedId: string): AiModelEntity {
    const model = this.getModel(fullyQualifiedId);
    if (!model) {
      throw new ModelNotFound(fullyQualifiedId);
    }
    return model;
  }

  /**
   * Get a provider by its ID.
   * @param providerId - The ID of the provider to get.
   * @returns The ai provider entity, or `null` if the provider is not found.
   */
  getProvider(providerId: string): AiProviderEntity | null {
    const pluginInstance = this.getPluginInstance(providerId);
    if (!pluginInstance) {
      return null;
    }
    return new AiProviderEntity({
      pluginInstance,
      configSchemaService: this.configSchemaService,
    });
  }

  /**
   * Get a provider by its ID and throw an error if it is not found.
   * @param providerId - The ID of the provider to get.
   * @returns The ai provider entity.
   * @throws {AiProviderNotFound} If the provider is not found.
   */
  getProviderOrThrow(providerId: string): AiProviderEntity {
    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new AiProviderNotFound(providerId);
    }
    return provider;
  }

  /**
   * Update the configuration values for a provider.
   * @param providerId - The ID of the provider to update.
   * @param configValues
   * @returns
   */
  async updateProviderConfig(providerId: string, configValues: ConfigValues) {
    const pluginInstance = this.getPluginInstance(providerId);
    if (!pluginInstance) {
      throw new AiProviderNotFound(providerId);
    }

    const schemaObj = pluginInstance.manifest.provider.config;
    if (!schemaObj) {
      throw new InvalidInput('Provider does not support configuration');
    }

    const inboundConfig = await this.configSchemaService
      .get(schemaObj)
      .processInboundValues(configValues);

    await this.prismaService.aiProviderConfig.upsert({
      where: { providerId },
      update: { config: inboundConfig },
      create: { providerId, config: inboundConfig },
    });

    return new AiProviderEntity({
      pluginInstance: this.updatePluginInstance(providerId, configValues),
      configSchemaService: this.configSchemaService,
    });
  }

  private async buildProviderRegistry() {
    const plugins = this.pluginRegistryService.listPlugins('ai');

    for (const registryEntry of plugins) {
      const derivedProviderId = registryEntry.derivedId;

      // Register model manifests with derived provider ID
      for (const modelManifest of Object.values(
        registryEntry.manifest.models ?? {}
      ) as AiModelManifest[]) {
        this.modelManifestRegistry.set(
          `${derivedProviderId}/${modelManifest.id}`,
          modelManifest
        );
      }

      // Get config from DB using derived ID
      const config = await this.getProviderConfigFromDb(
        derivedProviderId,
        registryEntry.manifest.provider?.config
      );
      this.providerPluginRegistry.set(derivedProviderId, {
        instance: new registryEntry.provider({
          manifest: registryEntry.manifest,
          configValues: config ?? {},
        }),
        ProviderClass: registryEntry.provider,
      });
    }
  }

  private getPluginInstance(providerId: string): AiProviderPlugin | null {
    const regEntry = this.providerPluginRegistry.get(providerId);
    return regEntry?.instance ?? null;
  }

  private updatePluginInstance(
    providerId: string,
    configValues: ConfigValues = {}
  ) {
    const regEntry = this.providerPluginRegistry.get(providerId);
    if (!regEntry) {
      throw new AiProviderNotFound(providerId);
    }
    regEntry.instance = new regEntry.ProviderClass({
      manifest: regEntry.instance.manifest,
      configValues,
    });
    return regEntry.instance;
  }

  private async getProviderConfigFromDb(
    providerId: string,
    schemaObj?: ConfigSchemaDefinition
  ) {
    const aiProviderConfig =
      await this.prismaService.aiProviderConfig.findUnique({
        where: {
          providerId,
        },
      });

    if (!aiProviderConfig) {
      return {};
    }

    try {
      return await this.configSchemaService
        .get(schemaObj)
        .processOutboundValues(aiProviderConfig?.config as ConfigValues);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Failed to decrypt data')
      ) {
        this.logger.warn(
          `Failed to decrypt config for AI provider "${providerId}", returning as is!`
        );
        return aiProviderConfig?.config as ConfigValues;
      }
      throw error;
    }
  }
}
