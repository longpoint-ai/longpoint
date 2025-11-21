import { type ConfigValues } from '@longpoint/config-schema';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { StorageProviderSummaryDto } from '../provider';

export interface StorageConfigParams {
  id: string;
  name: string;
  provider: StorageProviderSummaryDto;
  config?: ConfigValues | null;
  storageUnitCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

@ApiSchema({ name: 'StorageConfig' })
export class StorageConfigDto {
  @ApiProperty({
    description: 'The ID of the storage config',
    example: 'mbjq36xe6397dsi6x9nq4ghc',
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'The name of the storage config',
    example: 'App UGC',
  })
  name: string;

  @ApiProperty({
    description: 'The storage provider the config is for',
  })
  provider: StorageProviderSummaryDto;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Configuration for the provider',
    nullable: true,
    example: {},
  })
  config: ConfigValues | null;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Number of storage units using this config',
    example: 3,
  })
  storageUnitCount?: number;

  @ApiProperty({
    description: 'When the config was created',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the config was last updated',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(data: StorageConfigParams) {
    this.id = data.id;
    this.name = data.name;
    this.provider = data.provider;
    this.config = data.config ?? null;
    this.storageUnitCount = data.storageUnitCount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
