import { ConfigSchemaService } from '@/modules/common/services';
import { InvalidInput } from '@/shared/errors';
import { ConfigSchemaDefinition, ConfigValues } from '@longpoint/config-schema';
import {
  AiModelManifest,
  AiPluginManifest,
  AiProviderPlugin,
  AiProviderPluginArgs,
  PluginConfig,
} from '@longpoint/devkit';
import { findNodeModulesPath } from '@longpoint/utils/path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readdir } from 'fs/promises';
import { createRequire } from 'module';
import { join } from 'path';
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
    private readonly configSchemaService: ConfigSchemaService
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
    const modulesPath = findNodeModulesPath(process.cwd());
    if (!modulesPath) return;

    const modules = await readdir(modulesPath);
    const packageNames = modules.filter((module) =>
      module.startsWith('longpoint-ai-')
    );

    for (const packageName of packageNames) {
      const packagePath = join(modulesPath, packageName);
      const require = createRequire(__filename);
      const pluginConfig: PluginConfig = require(join(
        packagePath,
        'dist',
        'index.js'
      )).default;

      if (pluginConfig.type !== 'ai') continue;
      if (!pluginConfig.provider) {
        this.logger.error(
          `AI plugin ${packageName} has an invalid provider class`
        );
        continue;
      }
      if (!pluginConfig.manifest) {
        this.logger.error(`AI plugin ${packageName} has an invalid manifest`);
        continue;
      }

      const manifest = pluginConfig.manifest;
      const providerId = manifest.provider.id;

      for (const modelManifest of Object.values(
        manifest.models ?? {}
      ) as AiModelManifest[]) {
        this.modelManifestRegistry.set(
          `${providerId}/${modelManifest.id}`,
          modelManifest
        );
      }

      const config = await this.getProviderConfigFromDb(
        providerId,
        manifest.provider?.config
      );
      this.providerPluginRegistry.set(providerId, {
        instance: new pluginConfig.provider({
          manifest: manifest,
          configValues: config ?? {},
        }),
        ProviderClass: pluginConfig.provider,
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
