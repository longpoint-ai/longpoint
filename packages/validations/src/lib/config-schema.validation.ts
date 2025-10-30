import { ConfigSchema, ConfigValues } from '@longpoint/devkit';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates ConfigValues against a ConfigSchema
 * @param schema - The configuration schema to validate against
 * @param values - The configuration values to validate
 * @param path - Internal path for nested validation (used recursively)
 * @returns ValidationResult with valid boolean and detailed error messages
 */
export function validateConfigSchema(
  schema: ConfigSchema,
  values: ConfigValues,
  path = ''
): ValidationResult {
  const errors: string[] = [];

  // Check for unknown fields
  const schemaKeys = Object.keys(schema);
  const valueKeys = Object.keys(values);
  const unknownFields = valueKeys.filter((key) => !schemaKeys.includes(key));

  for (const unknownField of unknownFields) {
    const fieldPath = path ? `${path}.${unknownField}` : unknownField;
    errors.push(`${fieldPath} is not defined in the schema`);
  }

  // Validate each field in the schema
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const fieldPath = path ? `${path}.${fieldName}` : fieldName;
    const fieldValue = values[fieldName];

    // Check required fields
    if (
      fieldSchema.required &&
      (fieldValue === undefined || fieldValue === null || fieldValue === '')
    ) {
      errors.push(`${fieldPath} is required`);
      continue; // Skip further validation for missing required fields
    }

    // Skip validation if field is not provided and not required
    if (fieldValue === undefined || fieldValue === null) {
      continue;
    }

    // Validate field type
    const typeError = validateFieldType(
      fieldPath,
      fieldValue,
      fieldSchema.type
    );
    if (typeError) {
      errors.push(typeError);
      continue; // Skip nested validation if type is wrong
    }

    // Validate length constraints
    const lengthError = validateFieldLength(
      fieldPath,
      fieldValue,
      fieldSchema.type,
      fieldSchema.minLength,
      fieldSchema.maxLength
    );
    if (lengthError) {
      errors.push(lengthError);
    }

    // Validate nested objects
    if (fieldSchema.type === 'object' && fieldSchema.properties) {
      const nestedResult = validateConfigSchema(
        fieldSchema.properties,
        fieldValue as Record<string, unknown>,
        fieldPath
      );
      errors.push(...nestedResult.errors);
    }

    // Validate array items
    if (fieldSchema.type === 'array' && fieldSchema.items) {
      const arrayValue = fieldValue as unknown[];
      if (Array.isArray(arrayValue)) {
        for (let i = 0; i < arrayValue.length; i++) {
          const itemPath = `${fieldPath}[${i}]`;

          if (
            fieldSchema.items.type === 'object' &&
            fieldSchema.items.properties
          ) {
            const itemResult = validateConfigSchema(
              fieldSchema.items.properties,
              arrayValue[i] as Record<string, unknown>,
              itemPath
            );
            errors.push(...itemResult.errors);
          } else {
            const itemTypeError = validateFieldType(
              itemPath,
              arrayValue[i],
              fieldSchema.items.type
            );
            if (itemTypeError) {
              errors.push(itemTypeError);
            }
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a single field's type
 * @param path - The field path for error messages
 * @param value - The value to validate
 * @param expectedType - The expected type from the schema
 * @returns Error message if invalid, null if valid
 */
function validateFieldType(
  path: string,
  value: unknown,
  expectedType: string
): string | null {
  switch (expectedType) {
    case 'string':
    case 'secret':
      if (typeof value !== 'string') {
        return `${path} must be a string`;
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return `${path} must be a number`;
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        return `${path} must be a boolean`;
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        return `${path} must be an array`;
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return `${path} must be an object`;
      }
      break;

    default:
      break;
  }

  return null;
}

/**
 * Validates field length constraints
 * @param path - The field path for error messages
 * @param value - The value to validate
 * @param fieldType - The field type
 * @param minLength - Minimum length constraint
 * @param maxLength - Maximum length constraint
 * @returns Error message if invalid, null if valid
 */
function validateFieldLength(
  path: string,
  value: unknown,
  fieldType: string,
  minLength?: number,
  maxLength?: number
): string | null {
  if (minLength === undefined && maxLength === undefined) {
    return null;
  }

  let length: number;

  switch (fieldType) {
    case 'string':
    case 'secret':
      if (typeof value !== 'string') {
        return null; // Type validation will catch this
      }
      length = value.length;
      break;

    case 'array':
      if (!Array.isArray(value)) {
        return null; // Type validation will catch this
      }
      length = value.length;
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return null; // Type validation will catch this
      }
      length = Object.keys(value).length;
      break;

    default:
      // Length validation not applicable for other types
      return null;
  }

  if (minLength !== undefined && length < minLength) {
    return `${path} must have at least ${minLength} ${getLengthUnit(
      fieldType,
      minLength
    )}`;
  }

  if (maxLength !== undefined && length > maxLength) {
    return `${path} must have at most ${maxLength} ${getLengthUnit(
      fieldType,
      maxLength
    )}`;
  }

  return null;
}

/**
 * Gets the appropriate unit for length validation error messages
 * @param fieldType - The field type
 * @returns The unit string (characters, items, properties)
 */
function getLengthUnit(fieldType: string, count: number): string {
  const moreThanOne = count > 1;
  switch (fieldType) {
    case 'string':
    case 'secret':
      return 'character' + (moreThanOne ? 's' : '');
    case 'array':
      return 'item' + (moreThanOne ? 's' : '');
    case 'object':
      return 'propert' + (moreThanOne ? 'ies' : 'y');
    default:
      return 'element' + (moreThanOne ? 's' : '');
  }
}
