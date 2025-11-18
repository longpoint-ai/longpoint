import { ApiSchema, PickType } from '@nestjs/swagger';
import { VectorProviderDto, VectorProviderParams } from './vector-provider.dto';

export type VectorProviderShortParams = Pick<
  VectorProviderParams,
  'id' | 'name' | 'image'
>;

@ApiSchema({ name: 'VectorProviderShort' })
export class VectorProviderShortDto extends PickType(VectorProviderDto, [
  'id',
  'name',
  'image',
] as const) {
  constructor(data: VectorProviderShortParams) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.image = data.image ?? null;
  }
}
