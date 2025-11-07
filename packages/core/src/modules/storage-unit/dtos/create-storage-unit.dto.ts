import type { ConfigValues } from '@longpoint/config-schema';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiSchema,
  IntersectionType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { StorageUnitDto } from './storage-unit.dto';

@ApiSchema({ name: 'CreateStorageUnit' })
export class CreateStorageUnitDto extends IntersectionType(
  PickType(StorageUnitDto, ['name'] as const),
  PartialType(PickType(StorageUnitDto, ['isDefault'] as const))
) {
  @IsString()
  @ApiProperty({
    description: 'The name of the storage unit',
    example: 'My Storage Unit',
  })
  override name!: string;

  @IsString()
  @ApiProperty({
    description: 'The storage provider ID',
    example: 'local',
  })
  providerId!: string;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Provider-specific configuration',
    example: {},
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
