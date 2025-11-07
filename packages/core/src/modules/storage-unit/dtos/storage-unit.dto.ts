import { SelectedStorageUnit } from '@/shared/selectors/storage-unit.selectors';
import { ConfigValues } from '@longpoint/config-schema';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { StorageProviderDto } from './storage-provider.dto';

export interface StorageUnitParams
  extends Pick<
    SelectedStorageUnit,
    'id' | 'name' | 'isDefault' | 'createdAt' | 'updatedAt'
  > {
  config: ConfigValues | null;
  provider: StorageProviderDto;
}

@ApiSchema({ name: 'StorageUnit' })
export class StorageUnitDto {
  @ApiProperty({
    description: 'The ID of the storage unit',
    example: 'mbjq36xe6397dsi6x9nq4ghc',
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'The name of the storage unit',
    example: 'Local Default',
  })
  name: string;

  @ApiProperty({
    description: 'The storage provider',
  })
  provider: StorageProviderDto;

  @IsBoolean()
  @ApiProperty({
    description: 'Whether this is the default storage unit',
    example: true,
  })
  isDefault: boolean;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Provider-specific configuration (decrypted)',
    nullable: true,
    example: {},
  })
  config: ConfigValues | null;

  @ApiProperty({
    description: 'When the storage unit was created',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the storage unit was last updated',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(data: StorageUnitParams) {
    this.id = data.id;
    this.name = data.name;
    this.provider = data.provider;
    this.isDefault = data.isDefault;
    this.config = data.config;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
