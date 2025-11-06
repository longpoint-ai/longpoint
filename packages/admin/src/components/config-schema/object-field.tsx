import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@longpoint/ui/components/field';
import { ConfigSchemaField } from './config-schema-field';

import { Control } from 'react-hook-form';

interface ObjectFieldProps {
  namePrefix: string;
  schemaValue: any;
  label: string;
  description?: string | null;
  required: boolean;
  immutable?: boolean;
  allowImmutableFields?: boolean;
  control: Control<any>;
  fieldNamePrefix: string;
}

export function ObjectField({
  namePrefix,
  schemaValue,
  label,
  description,
  required,
  immutable = false,
  allowImmutableFields = false,
  control,
  fieldNamePrefix,
}: ObjectFieldProps) {
  const properties = schemaValue?.properties || {};
  return (
    <div className="space-y-3">
      <Field>
        <FieldLabel>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
          {immutable && (
            <span className="ml-1 text-muted-foreground text-xs">
              (immutable)
            </span>
          )}
        </FieldLabel>
        {description && (
          <FieldDescription>{String(description)}</FieldDescription>
        )}
      </Field>
      <FieldGroup>
        {Object.entries(properties).map(
          ([propKey, propSchema]: [string, any]) => {
            const propLabel = propSchema?.label ?? propKey;
            const propDesc = (propSchema?.description as any) ?? null;
            const propReq = Boolean(propSchema?.required);
            // Only disable immutable fields if we're not allowing them (i.e., in edit mode)
            const propImmutable = allowImmutableFields
              ? false
              : Boolean(propSchema?.immutable);
            const fieldName = `${namePrefix}.${propKey}`;
            return (
              <ConfigSchemaField
                key={propKey}
                name={fieldName}
                schemaValue={propSchema}
                label={propLabel}
                description={propDesc}
                required={propReq}
                immutable={propImmutable}
                allowImmutableFields={allowImmutableFields}
                control={control}
                namePrefix={fieldNamePrefix}
              />
            );
          }
        )}
      </FieldGroup>
    </div>
  );
}
