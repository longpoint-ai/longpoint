import { AiModelSummaryDto } from '@/modules/ai';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { VectorProviderShortDto } from './vector-provider-short.dto';

export interface VectorIndexParams {
  id: string;
  active: boolean;
  indexing: boolean;
  embeddingModel: AiModelSummaryDto | null;
  vectorProvider: VectorProviderShortDto;
  mediaIndexed: number;
  lastIndexedAt: Date | null;
}

@ApiSchema({ name: 'VectorIndex' })
export class VectorIndexDto {
  @ApiProperty({
    description: 'The ID of the vector index',
    example: 'o1jnduht9zboa0w1dcjfzqi5',
  })
  id: string;

  @ApiProperty({
    description: 'Whether the vector index is active',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Whether the vector index is currently indexing',
    example: false,
  })
  indexing: boolean;

  @ApiProperty({
    description: 'The embedding model used by the vector index',
    type: () => AiModelSummaryDto,
    nullable: true,
    example: {
      id: 'text-embedding-3-small',
      name: 'Text Embedding 3 Small',
      fullyQualifiedId: 'openai/text-embedding-3-small',
      provider: {
        id: 'openai',
        name: 'OpenAI',
        image: null,
        needsConfig: false,
      },
    },
  })
  embeddingModel: AiModelSummaryDto | null;

  @ApiProperty({
    description: 'The vector database provider used by the index',
    example: {
      id: 'pinecone',
      name: 'Pinecone',
      image: null,
    },
  })
  vectorProvider: VectorProviderShortDto;

  @ApiProperty({
    description: 'The number of media items indexed by the vector index',
    example: 100,
  })
  mediaIndexed: number;

  @ApiProperty({
    description: 'The date and time the index last ran successfully',
    example: '2025-01-01T00:00:00.000Z',
    nullable: true,
  })
  lastIndexedAt: Date | null;

  constructor(data: VectorIndexParams) {
    this.id = data.id;
    this.active = data.active;
    this.indexing = data.indexing;
    this.embeddingModel = data.embeddingModel;
    this.vectorProvider = data.vectorProvider;
    this.mediaIndexed = data.mediaIndexed;
    this.lastIndexedAt = data.lastIndexedAt;
  }
}
