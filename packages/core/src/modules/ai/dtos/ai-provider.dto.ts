import {
  ConfigSchemaForDto,
  toConfigSchemaForDto,
} from '@/shared/dtos/config-schema';
import { ConfigSchema, ConfigValues } from '@longpoint/devkit';
import { ApiProperty, ApiSchema, getSchemaPath } from '@nestjs/swagger';
import { AiModelShortDto, AiModelShortParams } from './ai-model-short.dto';

export interface AiProviderParams {
  id: string;
  name: string | null;
  image: string | null;
  needsConfig?: boolean;
  config?: ConfigValues;
  configSchema?: ConfigSchema;
  models: AiModelShortParams[];
}

@ApiSchema({ name: 'AiProvider' })
export class AiProviderDto {
  @ApiProperty({
    description: 'The ID of the AI provider',
    example: 'anthropic',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the AI provider',
    example: 'Anthropic',
  })
  name: string;

  @ApiProperty({
    description: 'An icon image of the AI provider',
    type: 'string',
    example:
      'https://www.gstatic.com/pantheon/images/aiplatform/model_garden/icons/icon-anthropic-v2.png',
  })
  image: string | null;

  @ApiProperty({
    description: 'Whether the provider needs additional configuration',
    type: 'boolean',
    example: false,
  })
  needsConfig: boolean;

  @ApiProperty({
    description: 'The config values for the provider',
    nullable: true,
    type: 'object',
    additionalProperties: true,
    example: {
      apiKey: 'sk-1234567890',
    },
  })
  config: ConfigValues | null;

  @ApiProperty({
    description: 'The schema for the provider config',
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath('ConfigSchemaValue'),
    },
    example: {
      apiKey: {
        label: 'API Key',
        type: 'secret',
        required: true,
      },
    },
    nullable: true,
  })
  configSchema: ConfigSchemaForDto | null;

  @ApiProperty({
    description: 'The models supported by the provider',
    type: () => AiModelShortDto,
    isArray: true,
    example: [
      {
        id: 'claude-haiku-4-5-20251001',
        name: 'Claude Haiku 4.5',
        fullyQualifiedId: 'anthropic/claude-haiku-4-5-20251001',
      },
    ],
  })
  models: AiModelShortDto[];

  constructor(data: AiProviderParams) {
    this.id = data.id;
    this.name = data.name ?? this.id;
    this.image = data.image ?? null;
    this.needsConfig = data.needsConfig ?? false;
    this.config = data.config ?? null;
    this.configSchema = data.configSchema
      ? toConfigSchemaForDto(data.configSchema)
      : null;
    this.models = data.models.map((model) => new AiModelShortDto(model));
  }
}
