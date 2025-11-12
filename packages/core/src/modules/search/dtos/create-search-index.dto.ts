import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ApiSchema({ name: 'CreateSearchIndex' })
export class CreateSearchIndexDto {
  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Whether to make the new index the active index.',
    example: true,
    default: false,
    type: Boolean,
  })
  active = false;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      "The fully qualified ID of the embedding model to use for the index. Leave blank to use the vector provider's embedding model, if supported.",
    example: 'openai/text-embedding-3-small',
  })
  embeddingModelId?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the vector provider to use for the index',
    example: 'pinecone',
  })
  vectorProviderId!: string;
}
