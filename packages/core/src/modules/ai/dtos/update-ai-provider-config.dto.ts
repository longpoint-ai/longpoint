import { type ConfigValues } from '@longpoint/config-schema';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

@ApiSchema({ name: 'UpdateAiProviderConfig' })
export class UpdateAiProviderConfigDto {
  @IsObject()
  @ApiProperty({
    description: 'The configuration values for the AI provider',
    example: {
      apiKey: '1234567890',
    },
  })
  config!: ConfigValues;
}
