import { type ConfigValues } from '@longpoint/config-schema';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export interface StorageProviderConfigParams {
  id: string;
  name: string;
  provider: string;
  config?: ConfigValues | null;
  usageCount?: number;
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

  @IsString()
  @ApiProperty({
    description: 'The storage provider ID this config is for',
    example: 's3',
  })
  provider: string;

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
  usageCount?: number;

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

  constructor(data: StorageProviderConfigParams) {
    this.id = data.id;
    this.name = data.name;
    this.provider = data.provider;
    this.config = data.config ?? null;
    this.usageCount = data.usageCount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

@ApiSchema({ name: 'StorageProviderConfigSummary' })
export class StorageProviderConfigSummaryDto {
  @ApiProperty({
    description: 'The ID of the storage provider config',
    example: 'mbjq36xe6397dsi6x9nq4ghc',
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'The name of the storage provider config',
    example: 'My S3 Config',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'The storage provider ID this config is for',
    example: 's3',
  })
  provider: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Number of storage units using this config',
    example: 3,
  })
  usageCount?: number;

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

  constructor(data: StorageProviderConfigParams) {
    this.id = data.id;
    this.name = data.name;
    this.provider = data.provider;
    this.usageCount = data.usageCount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
