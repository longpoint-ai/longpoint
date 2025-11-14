import { toConfigSchemaForDto } from '@/shared/dtos';
import { ApiSchema, PickType } from '@nestjs/swagger';
import { VectorProviderDto, VectorProviderParams } from './vector-provider.dto';

export type VectorProviderShortParams = Pick<
  VectorProviderParams,
  'id' | 'name' | 'image' | 'indexConfigSchema'
>;

@ApiSchema({ name: 'VectorProviderShort' })
export class VectorProviderShortDto extends PickType(VectorProviderDto, [
  'id',
  'name',
  'image',
  'indexConfigSchema',
] as const) {
  constructor(data: VectorProviderShortParams) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.image = data.image ?? null;
    this.indexConfigSchema = data.indexConfigSchema
      ? toConfigSchemaForDto(data.indexConfigSchema)
      : {};
  }
}
