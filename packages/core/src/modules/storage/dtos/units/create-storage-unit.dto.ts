import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

@ApiSchema({ name: 'CreateStorageUnit' })
export class CreateStorageUnitDto {
  @IsString()
  @ApiProperty({
    description: 'The name of the storage unit',
    example: 'My Storage Unit',
  })
  name!: string;

  @IsString()
  @ApiProperty({
    description: 'The storage config ID to use',
    example: 'mbjq36xe6397dsi6x9nq4ghc',
  })
  storageConfigId!: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Whether this should be the default storage unit',
    example: false,
    default: false,
  })
  isDefault?: boolean;
}
