import { ApiSchema, PickType } from '@nestjs/swagger';
import { AiProviderDto, AiProviderParams } from './ai-provider.dto';

export type AiProviderSummaryParams = Pick<
  AiProviderParams,
  'id' | 'name' | 'image' | 'needsConfig'
>;

@ApiSchema({ name: 'AiProviderSummary' })
export class AiProviderSummaryDto extends PickType(AiProviderDto, [
  'id',
  'name',
  'image',
  'needsConfig',
] as const) {
  constructor(data: AiProviderSummaryParams) {
    super();
    this.id = data.id;
    this.name = data.name ?? this.id;
    this.image = data.image ?? null;
    this.needsConfig = data.needsConfig ?? false;
  }
}
