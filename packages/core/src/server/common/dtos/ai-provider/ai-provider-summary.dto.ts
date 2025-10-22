import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export interface AiProviderSummaryParams {
  id: string;
  name?: string;
  needsConfig?: boolean;
}

@ApiSchema({ name: 'AiProviderSummary' })
export class AiProviderSummaryDto {
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
    description: 'Whether the provider needs additional configuration',
    example: false,
  })
  needsConfig: boolean;

  constructor(data: AiProviderSummaryParams) {
    this.id = data.id;
    this.name = data.name ?? this.id;
    this.needsConfig = data.needsConfig ?? false;
  }
}
