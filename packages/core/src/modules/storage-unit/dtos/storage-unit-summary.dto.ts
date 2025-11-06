import { ApiProperty, ApiSchema, PickType } from '@nestjs/swagger';
import { StorageProviderShortDto } from './storage-provider-short.dto';
import { StorageUnitDto, StorageUnitParams } from './storage-unit.dto';

export type StorageUnitSummaryParams = Pick<
  StorageUnitParams,
  'id' | 'name' | 'isDefault' | 'createdAt' | 'updatedAt'
> & {
  provider: StorageProviderShortDto;
};

@ApiSchema({ name: 'StorageUnitSummary' })
export class StorageUnitSummaryDto extends PickType(StorageUnitDto, [
  'id',
  'name',
  'isDefault',
  'createdAt',
  'updatedAt',
] as const) {
  @ApiProperty({
    description: 'The storage provider',
    type: StorageProviderShortDto,
  })
  provider: StorageProviderShortDto;

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
