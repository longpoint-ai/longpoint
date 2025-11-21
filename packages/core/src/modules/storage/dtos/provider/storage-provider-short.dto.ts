import { ApiSchema, PickType } from '@nestjs/swagger';
import {
  StorageProviderSummaryDto,
  StorageProviderSummaryParams,
} from './storage-provider-summary.dto';

export type StorageProviderShortParams = Pick<
  StorageProviderSummaryParams,
  'id' | 'name'
>;

@ApiSchema({ name: 'StorageProviderShort' })
export class StorageProviderShortDto extends PickType(
  StorageProviderSummaryDto,
  ['id', 'name'] as const
) {
  constructor(data: StorageProviderShortParams) {
    super();
    this.id = data.id;
    this.name = data.name;
  }
}
