import { ConfigValues } from '@longpoint/devkit';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export interface AiProviderParams {
  id: string;
  name: string | null;
  image: string | null;
  needsConfig?: boolean;
  config?: ConfigValues;
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
    example:
      'https://www.gstatic.com/pantheon/images/aiplatform/model_garden/icons/icon-anthropic-v2.png',
  })
  image: string | null;

  @ApiProperty({
    description: 'Whether the provider needs additional configuration',
    example: false,
  })
  needsConfig: boolean;

  @ApiProperty({
    description: 'The config values for the provider',
    nullable: true,
    example: {
      apiKey: 'sk-1234567890',
    },
  })
  config: ConfigValues | null;

  constructor(data: AiProviderParams) {
    this.id = data.id;
    this.name = data.name ?? this.id;
    this.image = data.image ?? null;
    this.needsConfig = data.needsConfig ?? false;
    this.config = data.config ?? null;
  }
}
