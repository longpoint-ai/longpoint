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
      configValues: args.configValues,
    });
    this.client = new Pinecone({
      apiKey: this.configValues.apiKey,
    });
  }

  async upsert(indexId: string, documents: VectorDocument[]): Promise<void> {
    await this.client.index(indexId).upsert(
      documents.map((d) => ({
        id: d.id,
        values: d.embedding,
        metadata: d.metadata,
      }))
    );
  }

  override async embedAndUpsert(
    indexName: string,
    documents: EmbedAndUpsertDocument[]
  ): Promise<void> {
    await this.client.index(indexName).upsertRecords(
      documents.map((d) => ({
        id: d.id,
        text: d.text,
        ...(d.metadata ? d.metadata : {}),
      }))
    );
  }

  async delete(indexId: string, documentIds: string[]): Promise<void> {
    await this.client.index(indexId).deleteMany(documentIds);
  }

  async dropIndex(indexId: string): Promise<void> {
    await this.client.index(indexId).deleteAll();
  }

  async search(
    indexId: string,
    queryVector: number[],
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    const result = await this.client.index(indexId).query({
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
    indexId: string,
    queryText: string,
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    const top = options?.limit ?? 10;
    const result = await this.client.index(indexId).searchRecords({
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
}
