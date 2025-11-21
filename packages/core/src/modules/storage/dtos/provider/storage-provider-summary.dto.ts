import { ApiSchema, PickType } from '@nestjs/swagger';
import {
  StorageProviderDto,
  StorageProviderParams,
} from './storage-provider.dto';

export type StorageProviderSummaryParams = Pick<
  StorageProviderParams,
  'id' | 'name' | 'image'
>;

@ApiSchema({ name: 'StorageProviderSummary' })
export class StorageProviderSummaryDto extends PickType(StorageProviderDto, [
  'id',
  'name',
  'image',
] as const) {
  constructor(data: StorageProviderSummaryParams) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.image = data.image ?? null;
  }
}
