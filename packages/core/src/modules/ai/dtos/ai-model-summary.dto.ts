import { ApiSchema, PickType } from '@nestjs/swagger';
import { AiModelDto } from './ai-model.dto';
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
export class AiModelSummaryDto extends PickType(AiModelDto, [
  'id',
  'name',
  'fullyQualifiedId',
  'provider',
] as const) {
  constructor(data: AiModelSummaryParams) {
    super();
    this.id = data.id;
    this.fullyQualifiedId = data.fullyQualifiedId;
    this.name = data.name ?? this.id;
    this.provider = new AiProviderSummaryDto(data.provider);
  }
}
