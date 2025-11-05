import { ConfigSchema } from '@longpoint/devkit';
import { ConfigSchemaValueDto } from './config-schema-value.dto';
import { ConfigSchemaForDto } from './config-schema.types';

export function toConfigSchemaForDto(schema: ConfigSchema): ConfigSchemaForDto {
  return Object.entries(schema).reduce((acc, [key, value]) => {
    acc[key] = new ConfigSchemaValueDto(value);
    return acc;
  }, {} as ConfigSchemaForDto);
}
