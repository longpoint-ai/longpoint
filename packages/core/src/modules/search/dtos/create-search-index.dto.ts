import type { ConfigValues } from '@longpoint/config-schema';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiSchema,
  PickType,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { SearchIndexDto } from './search-index.dto';

@ApiSchema({ name: 'CreateSearchIndex' })
export class CreateSearchIndexDto extends PickType(SearchIndexDto, [
  'name',
] as const) {
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

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Provider-specific configuration for the index',
    example: {},
  })
  config?: ConfigValues;
}
