import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export interface AiProviderSummaryParams {
  id: string;
  name?: string;
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

  constructor(data: AiProviderSummaryParams) {
    this.id = data.id;
    this.name = data.name ?? this.id;
  }
}
