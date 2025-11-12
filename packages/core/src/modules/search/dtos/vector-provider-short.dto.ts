import { ApiSchema, PickType } from '@nestjs/swagger';
import { VectorProviderDto } from './vector-provider.dto';

@ApiSchema({ name: 'VectorProviderShort' })
export class VectorProviderShortDto extends PickType(VectorProviderDto, [
  'id',
  'name',
  'image',
] as const) {}
