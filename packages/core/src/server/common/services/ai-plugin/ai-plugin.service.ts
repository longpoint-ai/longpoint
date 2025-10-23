import { AiManifest, AiProvider, ConfigValues } from '@longpoint/devkit';
import { findNodeModulesPath } from '@longpoint/utils/path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import { createRequire } from 'module';
import { join } from 'path';
import { AiModelEntity } from '../../entities';
import { ModelNotFound } from '../../errors';
import { PrismaService } from '../prisma/prisma.service';

interface ProviderRegistry {
  [providerId: string]: {
    provider: AiProvider;
    manifest: AiManifest;
    packagePath: string;
  };
}

@Injectable()
export class AiPluginService implements OnModuleInit {
  private readonly providerRegistry: ProviderRegistry = {};
  private readonly logger = new Logger(AiPluginService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    await this.buildProviderRegistry();
  }

  /**
   * List all installed models.
   * @returns A list of ai model entities.
   */
  async listInstalledModels() {
    return Object.values(this.providerRegistry).flatMap((registry) => {
      const models: AiModelEntity[] = [];

      for (const modelManifest of registry.manifest.provider.models) {
        const baseModel = registry.provider.getModel(modelManifest.id);
        if (baseModel) {
          models.push(
            new AiModelEntity(
              modelManifest.id,
              registry.manifest,
              baseModel,
              registry.provider.configValues
            )
          );
        }
      }

      return models;
    });
  }

  /**
   * Get a model by its fully qualified ID.
   * @param fullyQualifiedId - The fully qualified ID of the model to get.
   * @returns The ai model entity
   */
  async getModel(fullyQualifiedId: string): Promise<AiModelEntity | null> {
    const [providerId, modelId] = fullyQualifiedId.split('/');

    const registry = this.providerRegistry[providerId];

    if (!registry) {
      return null;
    }

    const baseModel = registry.provider.getModel(modelId);

    if (!baseModel) {
      return null;
    }

    return new AiModelEntity(
      modelId,
      registry.manifest,
      baseModel,
      registry.provider.configValues
    );
  }

  /**
   * Get a model by its fully qualified ID and throw an error if it is not found.
   * @param fullyQualifiedId - The fully qualified ID of the model to get.
   * @returns The ai model entity.
   * @throws {ModelNotFound} If the model is not found.
   */
  async getModelOrThrow(fullyQualifiedId: string): Promise<AiModelEntity> {
    const model = await this.getModel(fullyQualifiedId);
    if (!model) {
      throw new ModelNotFound(fullyQualifiedId);
    }
    return model;
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

      // Dynamically import the provider
      const require = createRequire(__filename);
      const providerModule = require(join(packagePath, 'dist', 'index.js'));
      const ProviderClass = providerModule.default;

      if (ProviderClass) {
        const config = await this.getProviderConfig(providerId);

        this.providerRegistry[providerId] = {
          provider: new ProviderClass({
            manifest: manifest.provider,
            configValues: config ?? {},
          }),
          manifest,
          packagePath,
        };
      }
    }
  }

  private async getProviderConfig(providerId: string) {
    const aiProviderConfig =
      await this.prismaService.aiProviderConfig.findUnique({
        where: {
          providerId,
        },
      });
    return aiProviderConfig?.config as ConfigValues | undefined;
  }
}
