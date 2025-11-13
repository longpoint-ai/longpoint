import { AiModelSummaryDto } from '@/modules/ai';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { VectorProviderShortDto } from './vector-provider-short.dto';

export interface VectorIndexParams {
  id: string;
  name: string;
  active: boolean;
  indexing: boolean;
  embeddingModel: AiModelSummaryDto | null;
  vectorProvider: VectorProviderShortDto;
  mediaIndexed: number;
  lastIndexedAt: Date | null;
}

@ApiSchema({ name: 'SearchIndex' })
export class SearchIndexDto {
  @ApiProperty({
    description: 'The ID of the index',
    example: 'o1jnduht9zboa0w1dcjfzqi5',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the index',
    example: 'my-index',
  })
  name: string;

  @ApiProperty({
    description: 'Whether the index is active',
    example: true,
    default: false,
  })
  active: boolean;

  @ApiProperty({
    description: 'Whether the index is currently indexing',
    example: false,
  })
  indexing: boolean;

  @ApiProperty({
    description: 'The model used by the index to generate vector embeddings',
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
    description: 'The number of media items indexed',
    example: 100,
  })
  mediaIndexed: number;

  @ApiProperty({
    description: 'The date and time the index last ran successfully',
    example: '2025-01-01T00:00:00.000Z',
    nullable: true,
    type: 'string',
  })
  lastIndexedAt: Date | null;

  constructor(data: VectorIndexParams) {
    this.id = data.id;
    this.name = data.name;
    this.active = data.active;
    this.indexing = data.indexing;
    this.embeddingModel = data.embeddingModel;
    this.vectorProvider = data.vectorProvider;
    this.mediaIndexed = data.mediaIndexed;
    this.lastIndexedAt = data.lastIndexedAt;
  }
}
