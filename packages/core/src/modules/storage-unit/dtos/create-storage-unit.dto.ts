import type { ConfigValues } from '@longpoint/devkit';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiSchema,
  IntersectionType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { StorageUnitDto } from './storage-unit.dto';

@ApiSchema({ name: 'CreateStorageUnit' })
export class CreateStorageUnitDto extends IntersectionType(
  PickType(StorageUnitDto, ['name', 'provider'] as const),
  PartialType(PickType(StorageUnitDto, ['isDefault'] as const))
) {
  @IsString()
  @ApiProperty({
    description: 'The name of the storage unit',
    example: 'My Storage Unit',
  })
  override name!: string;

  @IsEnum(['local', 's3', 'gcs', 'azure-blob'])
  @ApiProperty({
    description: 'The storage provider type',
    example: 'local',
    enum: ['local', 's3', 'gcs', 'azure-blob'],
  })
  override provider!: string;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Provider-specific configuration',
    example: {
      basePath: 'default',
    },
  })
  config?: ConfigValues;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Whether this should be the default storage unit',
    example: false,
    default: false,
  })
  override isDefault?: boolean;
}
