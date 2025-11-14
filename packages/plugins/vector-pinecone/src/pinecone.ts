import {
  EmbedAndUpsertDocument,
  SearchOptions,
  SearchResult,
  VectorDocument,
  VectorMetadata,
  VectorProviderPlugin,
  VectorProviderPluginArgs,
} from '@longpoint/devkit';
import { Pinecone } from '@pinecone-database/pinecone';
import { manifest } from './manifest.js';

export class PineconeVectorProvider extends VectorProviderPlugin<
  typeof manifest
> {
  private readonly client: Pinecone;

  constructor(args: VectorProviderPluginArgs<typeof manifest>) {
    super({
      manifest: args.manifest,
      providerConfigValues: args.providerConfigValues,
      indexConfigValues: args.indexConfigValues,
    });
    this.client = new Pinecone({
      apiKey: this.providerConfigValues.apiKey,
    });
  }

  async upsert(documents: VectorDocument[]): Promise<void> {
    await this.client.index(this.indexName).upsert(
      documents.map((d) => ({
        id: d.id,
        values: d.embedding,
        metadata: d.metadata,
      }))
    );
  }

  override async embedAndUpsert(
    documents: EmbedAndUpsertDocument[]
  ): Promise<void> {
    await this.client.index(this.indexName).upsertRecords(
      documents.map((d) => ({
        id: d.id,
        text: d.text,
        ...(d.metadata ? d.metadata : {}),
      }))
    );
  }

  async delete(documentIds: string[]): Promise<void> {
    await this.client.index(this.indexName).deleteMany(documentIds);
  }

  async dropIndex(): Promise<void> {
    await this.client.index(this.indexName).deleteAll();
  }

  async search(
    queryVector: number[],
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    const result = await this.client.index(this.indexName).query({
      vector: queryVector,
      topK: options?.limit ?? 10,
    });
    return result.matches.map((m) => ({
      id: m.id,
      score: m.score ?? 0,
      metadata: m.metadata as VectorMetadata,
    }));
  }

  override async embedAndSearch(
    queryText: string,
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    const top = options?.limit ?? 10;
    const result = await this.client.index(this.indexName).searchRecords({
      query: {
        topK: top,
        inputs: { text: queryText },
      },
      // rerank: {
      //   model: 'bge-reranker-v2-m3',
      //   rankFields: ['chunk_text'],
      //   topN: top,
      // },
    });
    return result.result.hits.map((h) => {
      const { _id, _score, fields } = h;
      return {
        id: _id,
        score: _score ?? 0,
        metadata: fields as VectorMetadata,
      };
    });
  }

  private get indexName(): string {
    return this.indexConfigValues.name;
  }
}
