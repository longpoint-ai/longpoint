import { ConfigSchemaService, PrismaService } from '@/modules/common/services';
import { InvalidInput, InvalidProviderConfig } from '@/shared/errors';
import { ConfigValues } from '@longpoint/config-schema';
import {
  PluginConfig,
  VectorPluginManifest,
  VectorProviderPlugin,
  VectorProviderPluginArgs,
} from '@longpoint/devkit';
import { findNodeModulesPath } from '@longpoint/utils/path';
import { toBase64DataUri } from '@longpoint/utils/string';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { existsSync } from 'fs';
import { readdir, readFile } from 'fs/promises';
import { createRequire } from 'module';
import { extname, join } from 'path';
import { VectorProviderEntity } from '../entities/vector-provider.entity';
import { VectorProviderNotFound } from '../search.errors';

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
    return Promise.all(
      Array.from(this.providerPluginRegistry.values()).map((regEntry) => {
        return this.getProviderByIdOrThrow(regEntry.manifest.id);
      })
    );
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

    try {
      const configValues = await this.configSchemaService
        .get(pluginRegistryEntry.manifest.configSchema)
        .processOutboundValues(configValuesFromDb);

      return new VectorProviderEntity({
        plugin: new pluginRegistryEntry.VectorProviderClass({
          configValues: configValues,
          manifest: pluginRegistryEntry.manifest,
        }),
      });
    } catch (e) {
      if (e instanceof InvalidInput) {
        throw new InvalidProviderConfig('vector', id, e.getMessages());
      }
      throw e;
    }
  }

  async getProviderByIdOrThrow(id: string) {
    const provider = await this.getProviderById(id);
    if (!provider) {
      throw new VectorProviderNotFound(id);
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
    const regEntry = this.providerPluginRegistry.get(providerId);
    if (!regEntry) {
      throw new VectorProviderNotFound(providerId);
    }

    const schemaObj = regEntry.manifest.configSchema;
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

    return await this.getProviderByIdOrThrow(providerId);
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

      if (pluginConfig.manifest.image) {
        const processedImage = await this.processImage(
          pluginConfig.manifest.image,
          packagePath
        );
        if (processedImage) {
          pluginConfig.manifest.image = processedImage;
        }
      }

      this.providerPluginRegistry.set(pluginConfig.manifest.id, {
        VectorProviderClass: pluginConfig.provider,
        manifest: pluginConfig.manifest,
      });
    }
  }

  /**
   * Process an image value from the manifest.
   * If it's a URL (starts with http:// or https://), return it as is.
   * If it's a local file path, read it and convert to a base64 data URI.
   * @param imageValue - The image value from the manifest (URL or local file path)
   * @param packagePath - The path to the plugin package
   * @returns The processed image value (URL or base64 data URI)
   */
  private async processImage(
    imageValue: string,
    packagePath: string
  ): Promise<string | undefined> {
    // If it's already a URL, return it as is
    if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) {
      return imageValue;
    }

    // Try to find the image file in the package
    // Check common locations: assets/, dist/assets/, or root
    const possiblePaths = [
      join(packagePath, 'assets', imageValue),
      join(packagePath, 'dist', 'assets', imageValue),
      join(packagePath, imageValue),
    ];

    let imagePath: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        imagePath = path;
        break;
      }
    }

    if (!imagePath) {
      this.logger.warn(
        `Image file not found for plugin at ${packagePath}: ${imageValue}`
      );
      return undefined;
    }

    try {
      // Read the image file
      const imageBuffer = await readFile(imagePath);

      // Determine MIME type from file extension
      const ext = extname(imagePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
      };

      const mimeType = mimeTypes[ext] || 'image/png';

      // Convert to base64 data URI
      const base64 = imageBuffer.toString('base64');
      return toBase64DataUri(mimeType, base64);
    } catch (error) {
      this.logger.error(
        `Failed to read image file ${imagePath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return undefined;
    }
  }
}
