import { ConfigSchema } from '@longpoint/devkit';
import { ApiProperty, ApiSchema, getSchemaPath } from '@nestjs/swagger';
import { ConfigSchemaItemsDto } from './config-schema-item.dto';

type ConfigSchemaValueParams = ConfigSchema[keyof ConfigSchema];

@ApiSchema({ name: 'ConfigSchemaValue' })
export class ConfigSchemaValueDto {
  @ApiProperty({
    description: 'The label of the field',
    example: 'Name',
  })
  label: string;

  @ApiProperty({
    description: 'The field type',
    example: 'string',
  })
  type: string;

  @ApiProperty({
    description: 'Whether the field is required',
    example: true,
  })
  required: boolean;

  @ApiProperty({
    description: 'A description of the field',
    example: 'The name of the user',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description:
      'The minimum allowable length of the field, if the field type supports length constraints',
    example: 1,
    default: null,
    nullable: true,
  })
  minLength: number | null;

  @ApiProperty({
    description:
      'The maximum allowable length of the field, if the field type supports length constraints',
    example: 10,
    default: null,
    nullable: true,
  })
  maxLength: number | null;

  @ApiProperty({
    description: 'The item schema, if the field type is an array',
    type: () => ConfigSchemaItemsDto,
    nullable: true,
  })
  items: ConfigSchemaItemsDto | null;

  @ApiProperty({
    description: 'The properties of the field, if the field type is an object',
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath('ConfigSchemaValue'),
    },
  })
  properties: Record<string, ConfigSchemaValueDto>;

  constructor(data: ConfigSchemaValueParams) {
    this.label = data.label;
    this.type = data.type;
    this.required = data.required ?? false;
    this.description = data.description ?? null;
    this.minLength = data.minLength ?? null;
    this.maxLength = data.maxLength ?? null;
    this.items = data.items ? new ConfigSchemaItemsDto(data.items) : null;
    this.properties = Object.entries(data.properties ?? {}).reduce(
      (acc, [k, v]) => {
        acc[k] = new ConfigSchemaValueDto(v);
        return acc;
      },
      {} as Record<string, ConfigSchemaValueDto>
    );
  }
}
