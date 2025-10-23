import { AiManifest, AiProvider, AiProviderArgs } from '@longpoint/devkit';
import { findNodeModulesPath } from '@longpoint/utils/path';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import { createRequire } from 'module';
import { join } from 'path';
import { ModelSummaryParams } from '../../dtos/model';
import { PrismaService } from '../prisma/prisma.service';

interface ProviderRegistry {
  [packageName: string]: {
    ProviderClass: new (
      args: AiProviderArgs<AiManifest>
    ) => AiProvider<AiManifest>;
    manifest: AiManifest;
    packagePath: string;
  };
}

@Injectable()
export class CommonModelService implements OnModuleInit {
  private readonly providerRegistry: ProviderRegistry = {};
  private readonly providerInstances = new Map<string, AiProvider>();

  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    await this.buildProviderRegistry();
  }

  listManifests() {
    return Object.values(this.providerRegistry).map(
      (registry) => registry.manifest
    );
  }

  /**
   * Get a model by its ID. The ID is in the format of `providerId/modelId`.
   * @param id - The ID of the model to get.
   * @returns The model instance.
   * @example
   * ```ts
   * const model = await this.commonModelService.getModel('anthropic/claude-haiku-4-5-20251001');
   * ```
   */
  async getModel(id: string) {
    const [providerId, modelId] = id.split('/');
    if (!providerId) {
      throw new Error(`No provider found for model: ${id}`);
    }

    const registry = this.providerRegistry[providerId];
    if (!registry) {
      throw new Error(`Provider registry not found for: ${providerId}`);
    }

    const providerConfig = await this.getProviderConfig(providerId);
    const needsConfig = this.providerNeedsConfig(providerId, providerConfig);
    if (needsConfig) {
      throw new Error(
        `${id} needs additional provider configuration before use.`
      );
    }

    let provider = this.providerInstances.get(providerId);
    if (!provider) {
      provider = new registry.ProviderClass({
        manifest: registry.manifest.provider,
        configValues: providerConfig ?? {},
        // TODO load config values
        modelConfigValues: {},
      });
      this.providerInstances.set(providerId, provider);
    }

    return provider.getModel(modelId);
  }

  /**
   * Return a JSON object representing a model.
   * @param id - The ID of the model to get.
   * @returns The model JSON object.
   */
  async getModelJson(id: string): Promise<ModelSummaryParams> {
    const [providerId, modelId] = id.split('/');

    const regEntry = this.providerRegistry[providerId];
    if (!regEntry) {
      throw new Error(`Provider registry not found for: ${providerId}`);
    }

    const manifest = regEntry.manifest.provider.models.find(
      (m) => m.id === modelId
    );
    if (!manifest) {
      throw new Error(`Model manifest not found for: ${id}`);
    }

    const config = await this.getProviderConfig(providerId);

    return {
      id,
      name: manifest.name,
      description: manifest.description,
      provider: {
        id: providerId,
        name: regEntry.manifest.provider.name,
        image: regEntry.manifest.provider.image,
        needsConfig: this.providerNeedsConfig(providerId, config),
      },
    };
  }

  /**
   * Check if the given provider needs additional configuration, based on the current configuration.
   * @param providerId - The ID of the provider to check.
   * @param currentConfig - The current configuration of the provider.
   * @returns True if the provider needs additional configuration, false otherwise.
   */
  providerNeedsConfig(providerId: string, currentConfig?: Record<string, any>) {
    const provider = this.providerRegistry[providerId];
    if (!provider) {
      return false;
    }

    const providerConfigSchema = provider.manifest.provider.config;
    const requiredFields = providerConfigSchema
      ? Object.entries(providerConfigSchema)
          .filter(([name, field]) => field.required)
          .map(([name]) => name)
      : [];

    if (requiredFields.length > 0) {
      if (!currentConfig) {
        return true;
      }
      for (const field of requiredFields) {
        if (!currentConfig[field]) {
          return true;
        }
      }
    }

    return false;
  }

  private async getProviderConfig(providerId: string) {
    const aiProviderConfig =
      await this.prismaService.aiProviderConfig.findUnique({
        where: {
          providerId,
        },
      });
    return aiProviderConfig?.config as Record<string, any> | undefined;
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
        this.providerRegistry[providerId] = {
          ProviderClass,
          manifest,
          packagePath,
        };
      }
    }
  }
}
