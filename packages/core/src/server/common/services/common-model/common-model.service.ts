import { AiManifest, AiProvider, AiProviderArgs } from '@longpoint/devkit';
import { findNodeModulesPath } from '@longpoint/utils/path';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import { createRequire } from 'module';
import { join } from 'path';

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
  getModel(id: string) {
    const [providerId, modelId] = id.split('/');
    if (!providerId) {
      throw new Error(`No provider found for model: ${id}`);
    }

    const registry = this.providerRegistry[providerId];
    if (!registry) {
      throw new Error(`Provider registry not found for: ${providerId}`);
    }

    let provider = this.providerInstances.get(providerId);
    if (!provider) {
      provider = new registry.ProviderClass({
        manifest: registry.manifest.provider,
        // TODO load config values
        configValues: { apiKey: '123' },
        modelConfigValues: {},
      });
      this.providerInstances.set(providerId, provider);
    }

    return provider.getModel(modelId);
  }

  private async buildProviderRegistry() {
    const modulesPath = findNodeModulesPath(process.cwd());
    if (!modulesPath) return;

    const modules = await readdir(modulesPath);
    const packageNames = modules.filter((module) =>
      module.startsWith('longpoint-ai-')
    );

    for (const packageName of packageNames) {
      const providerId = packageName.replace('longpoint-ai-', '');
      const packagePath = join(modulesPath, packageName);
      const manifestFile = await readFile(
        join(packagePath, 'ai-manifest.json')
      );
      const manifest = JSON.parse(manifestFile.toString());

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
