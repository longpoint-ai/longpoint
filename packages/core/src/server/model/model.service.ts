import { AiManifest } from '@longpoint/devkit';
import { findNodeModulesPath } from '@longpoint/utils/path';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { ModelSummaryDto } from './dtos/model-summary.dto';

@Injectable()
export class ModelService implements OnModuleInit {
  private readonly aiManifests = new Map<string, AiManifest>();

  async onModuleInit() {
    const modulesPath = findNodeModulesPath(process.cwd());

    if (!modulesPath) {
      return;
    }

    const modules = await readdir(modulesPath);
    const providerNames = modules.filter((module) =>
      module.startsWith('longpoint-ai-')
    );

    for (const provider of providerNames) {
      const manifestFile = await readFile(
        join(modulesPath, provider, 'ai-manifest.json')
      );
      const manifest = JSON.parse(manifestFile.toString());
      this.aiManifests.set(provider, manifest);
    }
  }

  async listModels() {
    const models: ModelSummaryDto[] = [];

    for (const manifest of this.aiManifests.values()) {
      const provider = manifest.provider;
      for (const model of provider.models) {
        models.push(
          new ModelSummaryDto({
            ...model,
            provider,
          })
        );
      }
    }

    return models;
  }
}
