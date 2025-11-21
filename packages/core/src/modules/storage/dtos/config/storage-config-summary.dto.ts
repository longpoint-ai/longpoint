import { ApiSchema, PickType } from '@nestjs/swagger';
import { StorageConfigDto, StorageConfigParams } from './storage-config.dto';

export type StorageConfigSummaryParams = Pick<
  StorageConfigParams,
  'id' | 'name' | 'provider' | 'storageUnitCount'
>;

@ApiSchema({ name: 'StorageConfigSummary' })
export class StorageConfigSummaryDto extends PickType(StorageConfigDto, [
  'id',
  'name',
  'provider',
  'storageUnitCount',
] as const) {
  constructor(data: StorageConfigSummaryParams) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.provider = data.provider;
    this.storageUnitCount = data.storageUnitCount;
  }
}
