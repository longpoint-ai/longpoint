import {
  ConfigSchemaService,
  PluginRegistryEntry,
} from '@/modules/common/services';
import { ConfigValues } from '@longpoint/config-schema';
import {
  EmbedAndUpsertDocument,
  SearchResult,
  VectorDocument,
  VectorProviderPlugin,
} from '@longpoint/devkit';
import { BaseVectorProviderEntity } from './base-vector-provider.entity';

export interface VectorProviderEntityArgs {
  pluginRegistryEntry: PluginRegistryEntry<'vector'>;
  plugin: VectorProviderPlugin;
  configSchemaService: ConfigSchemaService;
}

export class VectorProviderEntity extends BaseVectorProviderEntity {
  private readonly plugin: VectorProviderPlugin;

  constructor(args: VectorProviderEntityArgs) {
    super({
      id: args.pluginRegistryEntry.derivedId,
      displayName: args.pluginRegistryEntry.manifest.displayName,
      image: args.pluginRegistryEntry.manifest.image,
      supportsEmbedding:
        args.pluginRegistryEntry.manifest.supportsEmbedding ?? false,
      providerConfigSchema:
        args.pluginRegistryEntry.manifest.providerConfigSchema,
      providerConfigValues: args.plugin.providerConfigValues,
      indexConfigSchema: args.pluginRegistryEntry.manifest.indexConfigSchema,
      configSchemaService: args.configSchemaService,
    });
    this.plugin = args.plugin;
  }

  upsert(
    documents: VectorDocument[],
    indexConfigValues: ConfigValues
  ): Promise<void> {
    return this.plugin.upsert(documents, indexConfigValues);
  }

  embedAndUpsert(
    documents: EmbedAndUpsertDocument[],
    indexConfigValues: ConfigValues
  ): Promise<void> {
    return this.plugin.embedAndUpsert(documents, indexConfigValues);
  }

  delete(
    documentIds: string[],
    indexConfigValues: ConfigValues
  ): Promise<void> {
    return this.plugin.delete(documentIds, indexConfigValues);
  }

  search(
    queryVector: number[],
    indexConfigValues: ConfigValues
  ): Promise<SearchResult[]> {
    return this.plugin.search(queryVector, indexConfigValues);
  }

  embedAndSearch(
    queryText: string,
    indexConfigValues: ConfigValues
  ): Promise<SearchResult[]> {
    return this.plugin.embedAndSearch(queryText, indexConfigValues);
  }

  dropIndex(indexConfigValues: ConfigValues): Promise<void> {
    return this.plugin.dropIndex(indexConfigValues);
  }
}
