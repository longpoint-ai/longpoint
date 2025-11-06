import { ApiSchema, PickType } from '@nestjs/swagger';
import {
  StorageProviderDto,
  StorageProviderParams,
} from './storage-provider.dto';

export type StorageProviderShortParams = Pick<
  StorageProviderParams,
  'id' | 'name' | 'image'
>;

@ApiSchema({ name: 'StorageProviderShort' })
export class StorageProviderShortDto extends PickType(StorageProviderDto, [
  'id',
  'name',
  'image',
] as const) {
  constructor(data: StorageProviderShortParams) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.image = data.image ?? null;
  }
}
