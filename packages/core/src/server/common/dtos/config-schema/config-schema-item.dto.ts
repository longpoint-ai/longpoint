import { ConfigSchema } from '@longpoint/devkit';
import { ApiProperty, ApiSchema, getSchemaPath } from '@nestjs/swagger';
import { ConfigSchemaValueDto } from './config-schema-value.dto';

type ConfigSchemaItemParams = Required<
  ConfigSchema[keyof ConfigSchema]
>['items'];

@ApiSchema({ name: 'ConfigSchemaItems' })
export class ConfigSchemaItemsDto {
  @ApiProperty({
    description: 'The field type of the items',
    example: 'string',
  })
  type: string;

  @ApiProperty({
    description: 'The properties of the items, if the items are objects',
    type: 'object',
    additionalProperties: {
      $ref: getSchemaPath('ConfigSchemaValue'),
    },
  })
  properties: Record<string, ConfigSchemaValueDto>;

  @ApiProperty({
    description: 'The minimum allowable length of the array',
    example: 1,
    default: null,
    nullable: true,
  })
  minLength: number | null;

  @ApiProperty({
    description: 'The maximum allowable length of the array',
    example: 10,
    default: null,
    nullable: true,
  })
  maxLength: number | null;

  constructor(data: ConfigSchemaItemParams) {
    this.type = data.type;
    this.minLength = data.minLength ?? null;
    this.maxLength = data.maxLength ?? null;
    this.properties = Object.entries(data.properties ?? {}).reduce(
      (acc, [k, v]) => {
        acc[k] = new ConfigSchemaValueDto(v);
        return acc;
      },
      {} as Record<string, ConfigSchemaValueDto>
    );
  }
}
