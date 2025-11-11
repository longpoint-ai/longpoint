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
      configSchema: args.plugin.manifest.configSchema,
      configSchemaService: args.configSchemaService,
    });
    this.plugin = args.plugin;
  }

  upsert(indexId: string, documents: VectorDocument[]): Promise<void> {
    return this.plugin.upsert(indexId, documents);
  }

  embedAndUpsert(
    indexId: string,
    documents: EmbedAndUpsertDocument[]
  ): Promise<void> {
    return this.plugin.embedAndUpsert(indexId, documents);
  }

  delete(indexId: string, documentIds: string[]): Promise<void> {
    return this.plugin.delete(indexId, documentIds);
  }

  search(
    indexId: string,
    queryVector: number[],
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    return this.plugin.search(indexId, queryVector, options);
  }

  embedAndSearch(
    indexId: string,
    queryText: string,
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    return this.plugin.embedAndSearch(indexId, queryText, options);
  }

  dropIndex(indexId: string): Promise<void> {
    return this.plugin.dropIndex(indexId);
  }
}
