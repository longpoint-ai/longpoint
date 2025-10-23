import {
  AiProviderSummaryDto,
  AiProviderSummaryParams,
} from '@/server/common/dtos/ai-provider';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export interface ModelSummaryParams {
  id: string;
  name?: string;
  description?: string | null;
  provider: AiProviderSummaryParams;
}

@ApiSchema({ name: 'ModelSummary' })
export class ModelSummaryDto {
  @ApiProperty({
    description: 'The ID of the model',
    example: 'claude-haiku-4-5-20251001',
  })
  id: string;

  @ApiProperty({
    description: 'The display name of the model',
    example: 'Claude Haiku 4.5',
  })
  name: string;

  @ApiProperty({
    description: 'A brief description of the model',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'The provider of the model',
    type: AiProviderSummaryDto,
  })
  provider: AiProviderSummaryDto;

  constructor(data: ModelSummaryParams) {
    this.id = data.id;
    this.name = data.name ?? this.id;
    this.description = data.description ?? null;
    this.provider = new AiProviderSummaryDto(data.provider);
  }
}
