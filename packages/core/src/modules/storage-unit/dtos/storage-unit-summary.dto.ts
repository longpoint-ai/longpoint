import { ApiSchema, PickType } from '@nestjs/swagger';
import { StorageUnitDto, StorageUnitParams } from './storage-unit.dto';

export type StorageUnitSummaryParams = Pick<
  StorageUnitParams,
  'id' | 'name' | 'provider' | 'isDefault' | 'createdAt' | 'updatedAt'
>;

@ApiSchema({ name: 'StorageUnitSummary' })
export class StorageUnitSummaryDto extends PickType(StorageUnitDto, [
  'id',
  'name',
  'provider',
  'isDefault',
  'createdAt',
  'updatedAt',
] as const) {
  constructor(data: StorageUnitSummaryParams) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.provider = data.provider;
    this.isDefault = data.isDefault;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
