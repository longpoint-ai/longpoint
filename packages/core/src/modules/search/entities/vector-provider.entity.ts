import { ConfigSchemaService } from '@/modules/common/services';
import {
  EmbedAndUpsertDocument,
  SearchOptions,
  SearchResult,
  VectorDocument,
  VectorProvider,
  VectorProviderPlugin,
} from '@longpoint/devkit';
import { BaseVectorProviderEntity } from './base-vector-provider.entity';

export interface VectorProviderEntityArgs {
  plugin: VectorProviderPlugin;
  configSchemaService: ConfigSchemaService;
}

export class VectorProviderEntity
  extends BaseVectorProviderEntity
  implements VectorProvider
{
  private readonly plugin: VectorProviderPlugin;

  constructor(args: VectorProviderEntityArgs) {
    super({
      id: args.plugin.id,
      name: args.plugin.name,
      image: args.plugin.manifest.image,
      supportsEmbedding: args.plugin.manifest.supportsEmbedding ?? false,
      providerConfigSchema: args.plugin.manifest.providerConfigSchema,
      providerConfigValues: args.plugin.providerConfigValues,
      indexConfigSchema: args.plugin.manifest.indexConfigSchema,
      configSchemaService: args.configSchemaService,
    });
    this.plugin = args.plugin;
  }

  upsert(documents: VectorDocument[]): Promise<void> {
    return this.plugin.upsert(documents);
  }

  embedAndUpsert(documents: EmbedAndUpsertDocument[]): Promise<void> {
    return this.plugin.embedAndUpsert(documents);
  }

  delete(documentIds: string[]): Promise<void> {
    return this.plugin.delete(documentIds);
  }

  search(
    queryVector: number[],
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    return this.plugin.search(queryVector, options);
  }

  embedAndSearch(
    queryText: string,
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    return this.plugin.embedAndSearch(queryText, options);
  }

  dropIndex(): Promise<void> {
    return this.plugin.dropIndex();
  }
}
