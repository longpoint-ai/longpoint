import { type ConfigValues } from '@longpoint/config-schema';
import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

@ApiSchema({ name: 'CreateStorageConfig' })
export class CreateStorageConfigDto {
  @IsString()
  @ApiProperty({
    description: 'The name of the storage config',
    example: 'App UGC',
  })
  name!: string;

  @IsString()
  @ApiProperty({
    description: 'The storage provider ID',
    example: 'storage-s3',
  })
  providerId!: string;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Provider-specific configuration',
    example: {},
  })
  config?: ConfigValues;
}
