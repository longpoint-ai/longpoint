import { AiModelEntity } from '@/modules/ai';
import { SearchIndexDto } from '../dtos';
import { VectorProviderEntity } from './vector-provider.entity';

export interface SearchIndexEntityArgs {
  id: string;
  active: boolean;
  indexing: boolean;
  mediaIndexed: number;
  lastIndexedAt: Date | null;
  vectorProvider: VectorProviderEntity;
  embeddingModel: AiModelEntity | null;
}

export class SearchIndexEntity {
  readonly id: string;
  private _active: boolean;
  private _indexing: boolean;
  private _mediaIndexed: number;
  private _lastIndexedAt: Date | null;
  private readonly vectorProvider: VectorProviderEntity;
  private readonly embeddingModel: AiModelEntity | null;

  constructor(args: SearchIndexEntityArgs) {
    this.id = args.id;
    this._active = args.active;
    this._indexing = args.indexing;
    this._mediaIndexed = args.mediaIndexed;
    this._lastIndexedAt = args.lastIndexedAt;
    this.vectorProvider = args.vectorProvider;
    this.embeddingModel = args.embeddingModel;
  }

  toDto(): SearchIndexDto {
    return new SearchIndexDto({
      id: this.id,
      active: this._active,
      indexing: this._indexing,
      embeddingModel: this.embeddingModel?.toSummaryDto() ?? null,
      vectorProvider: this.vectorProvider.toShortDto(),
      mediaIndexed: this._mediaIndexed,
      lastIndexedAt: this._lastIndexedAt,
    });
  }

  get active(): boolean {
    return this._active;
  }

  get indexing(): boolean {
    return this._indexing;
  }

  get mediaIndexed(): number {
    return this._mediaIndexed;
  }

  get lastIndexedAt(): Date | null {
    return this._lastIndexedAt;
  }
}
