import { ConfigSchema } from '@longpoint/devkit';
import { FieldGroup } from '@longpoint/ui/components/field';
import { Control, UseFormSetError } from 'react-hook-form';
import { ConfigSchemaField } from './config-schema-field';
import { validateConfigSchema } from './config-schema-utils';

// Allow for more flexible schema types from API responses
type FlexibleConfigSchema = {
  [key: string]: {
    label: string;
    type: string;
    required?: boolean;
    description?: string | null;
    minLength?: number | null;
    maxLength?: number | null;
    items?: {
      type: string;
      properties?: FlexibleConfigSchema;
      minLength?: number | null;
      maxLength?: number | null;
    } | null;
    properties?: FlexibleConfigSchema;
  };
};

export interface ConfigSchemaFormProps {
  schema: ConfigSchema | FlexibleConfigSchema;
  control: Control<any>;
  namePrefix?: string;
  setError?: UseFormSetError<any>;
}

/**
 * Validates the config schema form values
 * This should be called before form submission
 */
export function validateConfigSchemaForm(
  schema: ConfigSchema | FlexibleConfigSchema | undefined,
  values: any,
  namePrefix: string,
  setError: UseFormSetError<any>
): boolean {
  return validateConfigSchema(
    schema as ConfigSchema,
    values,
    namePrefix,
    setError
  );
}

export function ConfigSchemaForm({
  schema,
  control,
  namePrefix = '',
  setError,
}: ConfigSchemaFormProps) {
  return (
    <FieldGroup>
      {Object.entries(schema).map(([key, value]: [string, any]) => {
        const label = value?.label ?? key;
        const description = (value?.description as any) ?? null;
        const required = Boolean(value?.required);
        const fieldName = namePrefix ? `${namePrefix}.${key}` : key;
        const fieldNamePrefix = namePrefix || 'config';

        return (
          <ConfigSchemaField
            key={key}
            name={fieldName}
            schemaValue={value}
            label={label}
            description={description}
            required={required}
            control={control}
            namePrefix={fieldNamePrefix}
          />
        );
      })}
    </FieldGroup>
  );
}

// Export utility function for consumers who need to validate manually
export { getDefaultValueForType } from './config-schema-utils';
