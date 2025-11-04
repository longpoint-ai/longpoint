import { ApiSchema, PickType } from '@nestjs/swagger';
import { AiModelDto } from './ai-model.dto';

export type AiModelShortParams = Pick<
  AiModelDto,
  'id' | 'name' | 'fullyQualifiedId' | 'description'
>;

@ApiSchema({ name: 'AiModelShort' })
export class AiModelShortDto extends PickType(AiModelDto, [
  'id',
  'name',
  'fullyQualifiedId',
  'description',
] as const) {
  constructor(data: AiModelShortParams) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.fullyQualifiedId = data.fullyQualifiedId;
    this.description = data.description;
  }
}
