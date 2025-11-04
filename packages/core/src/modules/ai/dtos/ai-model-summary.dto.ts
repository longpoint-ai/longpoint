import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  AiProviderSummaryDto,
  AiProviderSummaryParams,
} from './ai-provider-summary.dto';

export interface AiModelSummaryParams {
  id: string;
  fullyQualifiedId: string;
  name?: string;
  description?: string | null;
  provider: AiProviderSummaryParams;
}

@ApiSchema({ name: 'AiModelSummary' })
export class AiModelSummaryDto {
  @ApiProperty({
    description: 'The ID of the model',
    example: 'claude-haiku-4-5-20251001',
  })
  id: string;

  @ApiProperty({
    description: 'The fully qualified ID of the model',
    example: 'anthropic/claude-haiku-4-5-20251001',
  })
  fullyQualifiedId: string;

  @ApiProperty({
    description: 'The display name of the model',
    example: 'Claude Haiku 4.5',
  })
  name: string;

  @ApiProperty({
    description: 'The provider of the model',
    type: AiProviderSummaryDto,
  })
  provider: AiProviderSummaryDto;

  constructor(data: AiModelSummaryParams) {
    this.id = data.id;
    this.fullyQualifiedId = data.fullyQualifiedId;
    this.name = data.name ?? this.id;
    this.provider = new AiProviderSummaryDto(data.provider);
  }
}
