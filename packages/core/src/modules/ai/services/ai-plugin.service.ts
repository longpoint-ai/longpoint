import {
  AiProviderNotFound,
  InvalidInput,
  ModelNotFound,
} from '@/shared/errors';
import {
  AiModelManifest,
  AiPluginManifest,
  AiProviderPlugin,
  AiProviderPluginArgs,
  ConfigSchema,
  ConfigValues,
} from '@longpoint/devkit';
import { findNodeModulesPath } from '@longpoint/utils/path';
import { validateConfigSchema } from '@longpoint/validations';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import { createRequire } from 'module';
import { join } from 'path';
import { AiModelEntity } from '../../common/entities';
import { EncryptionService } from '../../common/services/encryption/encryption.service';
import { PrismaService } from '../../common/services/prisma/prisma.service';
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
    private readonly encryptionService: EncryptionService
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
      return new AiProviderEntity({ pluginInstance: regEntry.instance });
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
    return new AiProviderEntity({ pluginInstance });
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

    const configSchema = pluginInstance.manifest.provider.config;
    if (!configSchema) {
      throw new InvalidInput('Provider does not support configuration');
    }

    const validationResult = validateConfigSchema(configSchema, configValues);
    if (!validationResult.valid) {
      throw new InvalidInput(validationResult.errors);
    }

    const encryptedConfig = this.encryptionService.encryptConfigValues(
      configValues,
      configSchema
    );
    await this.prismaService.aiProviderConfig.upsert({
      where: { providerId },
      update: { config: encryptedConfig },
      create: { providerId, config: encryptedConfig },
    });

    return new AiProviderEntity({
      pluginInstance: this.updatePluginInstance(providerId, configValues),
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
      const manifestFile = await readFile(
        join(packagePath, 'ai-manifest.json')
      );
      const manifest = JSON.parse(manifestFile.toString());
      const providerId =
        manifest.provider?.id ?? packageName.replace('longpoint-ai-', '');

      const require = createRequire(__filename);
      const providerModule = require(join(packagePath, 'dist', 'index.js'));
      const ProviderClass = providerModule.default;

      for (const modelManifest of Object.values(
        manifest.models ?? {}
      ) as AiModelManifest[]) {
        this.modelManifestRegistry.set(
          `${providerId}/${modelManifest.id}`,
          modelManifest
        );
      }

      if (ProviderClass) {
        const config = await this.getProviderConfigFromDb(
          providerId,
          manifest.provider?.config
        );
        this.providerPluginRegistry.set(providerId, {
          instance: new ProviderClass({
            manifest: manifest,
            configValues: config ?? {},
          }),
          ProviderClass,
        });
      }
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
    configSchema: ConfigSchema
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
      return this.encryptionService.decryptConfigValues(
        aiProviderConfig?.config as ConfigValues,
        configSchema
      );
    } catch (e) {
      if (e instanceof Error && e.message.includes('Failed to decrypt data')) {
        this.logger.warn(
          `Failed to decrypt config for AI provider "${providerId}", returning as is!`
        );
        return aiProviderConfig?.config as ConfigValues;
      }
      throw e;
    }
  }
}
