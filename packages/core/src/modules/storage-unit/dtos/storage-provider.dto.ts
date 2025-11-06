import { type ConfigSchemaForDto, toConfigSchemaForDto } from '@/shared/dtos';
import { ConfigSchemaDefinition } from '@longpoint/config-schema';
import { ApiProperty, ApiSchema, getSchemaPath } from '@nestjs/swagger';

export interface StorageProviderParams {
  id: string;
  name: string;
  image?: string | null;
  configSchema?: ConfigSchemaDefinition;
}

@ApiSchema({ name: 'StorageProvider' })
export class StorageProviderDto {
  @ApiProperty({
    description: 'The ID of the storage provider',
    example: 'local',
  })
  id: string;

  @ApiProperty({
    description: 'The display name of the storage provider',
    example: 'Local',
  })
  name: string;

  @ApiProperty({
    description: 'An icon image of the storage provider',
    type: 'string',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({
    description: 'The schema for the storage provider config',
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath('ConfigSchemaValue'),
    },
    example: {
      folderName: {
        label: 'Folder Name',
        type: 'string',
        required: true,
      },
    },
  })
  configSchema: ConfigSchemaForDto;

  constructor(data: StorageProviderParams) {
    this.id = data.id;
    this.name = data.name;
    this.image = data.image ?? null;
    this.configSchema = data.configSchema
      ? toConfigSchemaForDto(data.configSchema)
      : {};
  }
}
