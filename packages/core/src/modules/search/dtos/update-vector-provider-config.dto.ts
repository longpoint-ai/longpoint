import type { ConfigValues } from '@longpoint/config-schema';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

@ApiSchema({ name: 'UpdateVectorProviderConfig' })
export class UpdateVectorProviderConfigDto {
  @IsObject()
  @ApiProperty({
    description: 'The configuration values for the vector provider',
    example: {
      apiKey: '1234567890',
    },
  })
  config!: ConfigValues;
}
