import {
  type ConfigSchemaForDto,
  toConfigSchemaForDto,
} from '@/shared/dtos/config-schema';
import { ConfigSchemaDefinition, ConfigValues } from '@longpoint/config-schema';
import { ApiProperty, ApiSchema, getSchemaPath } from '@nestjs/swagger';

export interface VectorProviderParams {
  id: string;
  name: string;
  image?: string | null;
  supportsEmbedding?: boolean;
  config?: ConfigValues;
  configSchema?: ConfigSchemaDefinition;
  indexConfigSchema?: ConfigSchemaDefinition;
}

@ApiSchema({ name: 'VectorProvider' })
export class VectorProviderDto {
  @ApiProperty({
    description: 'The ID of the vector provider',
    example: 'pinecone',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the vector provider',
    example: 'Pinecone',
  })
  name: string;

  @ApiProperty({
    description: 'An optional icon image of the vector provider',
    type: 'string',
    example:
      'https://www.gstatic.com/pantheon/images/aiplatform/model_garden/icons/icon-pinecone-v2.png',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({
    description:
      'Whether the vector provider is capable of embedding documents without an external model',
    type: 'boolean',
    example: true,
  })
  supportsEmbedding: boolean;

  @ApiProperty({
    description: 'The configuration values for the vector provider',
    type: 'object',
    additionalProperties: true,
    example: {
      apiKey: 'sk-1234567890',
    },
    nullable: true,
  })
  config: ConfigValues | null;

  @ApiProperty({
    description: 'The schema for the vector provider config',
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath('ConfigSchemaValue'),
    },
  })
  configSchema: ConfigSchemaForDto;

  @ApiProperty({
    description: 'The schema for the vector provider index config',
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath('ConfigSchemaValue'),
    },
  })
  indexConfigSchema: ConfigSchemaForDto;

  constructor(data: VectorProviderParams) {
    this.id = data.id;
    this.name = data.name;
    this.image = data.image ?? null;
    this.supportsEmbedding = data.supportsEmbedding ?? false;
    this.config = data.config ?? null;
    this.configSchema = data.configSchema
      ? toConfigSchemaForDto(data.configSchema)
      : {};
    this.indexConfigSchema = data.indexConfigSchema
      ? toConfigSchemaForDto(data.indexConfigSchema)
      : {};
  }
}
