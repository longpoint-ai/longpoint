import {
  ConfigSchemaDefinition,
  ConfigValues,
  ValidationResult,
} from './types.js';

export interface ConfigSchemaOptions {
  /**
   * Encryption function for secret values.
   * @param value
   * @returns
   */
  encrypt?: (value: string) => string | Promise<string>;
  /**
   * Decryption function for secret values.
   * @param value
   * @returns
   */
  decrypt?: (value: string) => string | Promise<string>;
  /**
   * Error class to throw when validation fails.
   */
  validationErrorClass?: new (errors: string[]) => Error;
}

export class ConfigSchema {
  private readonly decrypt: (value: string) => string | Promise<string>;
  private readonly encrypt: (value: string) => string | Promise<string>;
  private readonly validationErrorClass?: new (errors: string[]) => Error;

  constructor(
    private readonly schema: ConfigSchemaDefinition,
    options?: ConfigSchemaOptions
  ) {
    this.decrypt = options?.decrypt ?? ((value: string) => value);
    this.encrypt = options?.encrypt ?? ((value: string) => value);
    this.validationErrorClass = options?.validationErrorClass;
  }

  /**
   * Validates configuration values against the schema.
   * @param values - The configuration values to validate.
   * @returns ValidationResult with valid boolean and detailed error messages.
   */
  validate(values: ConfigValues): ValidationResult {
    return this.validateInternal(this.schema, values);
  }

  /**
   * Processes inbound configuration values.
   * @param values - The configuration values to process.
   * @returns The processed configuration values.
   * @example
   * const configSchema = new ConfigSchema({
   *   name: {
   *     type: 'secret',
   *     required: true,
   *   },
   *   description: {
   *     type: 'string',
   *     required: false,
   *   },
   * });
   * const values = { name: 'test', description: 'test' };
   * const processedValues = await configSchema.processInboundValues(values);
   * // processedValues = { name: 'some-encrypted-value', description: 'test' }
   */
  async processInboundValues(values: ConfigValues): Promise<ConfigValues> {
    const validationResult = this.validate(values);
    if (!validationResult.valid) {
      if (this.validationErrorClass) {
        throw new this.validationErrorClass(validationResult.errors);
      }
      throw new Error(validationResult.errors.join(', '));
    }
    const encryptedValues = await this.encryptConfigValues(values, this.schema);
    return encryptedValues;
  }

  /**
   * Processes outbound configuration values.
   * @param values - The configuration values to process.
   * @returns The processed configuration values.
   * @example
   * const configSchema = new ConfigSchema({
   *   name: {
   *     type: 'secret',
   *     required: true,
   *   },
   *   description: {
   *     type: 'string',
   *     required: false,
   *   },
   * });
   * const values = { name: 'some-encrypted-value', description: 'test' };
   * const processedValues = await configSchema.processOutboundValues(values);
   * // processedValues = { name: 'test', description: 'test' }
   */
  async processOutboundValues(values: ConfigValues): Promise<ConfigValues> {
    const decryptedValues = await this.decryptConfigValues(values, this.schema);
    const validationResult = this.validate(decryptedValues);
    if (!validationResult.valid) {
      if (this.validationErrorClass) {
        throw new this.validationErrorClass(validationResult.errors);
      }
      throw new Error(validationResult.errors.join(', '));
    }
    return decryptedValues;
  }

  private validateInternal(
    schema: ConfigSchemaDefinition,
    values: ConfigValues,
    path = ''
  ) {
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
      const typeError = this.validateFieldType(
        fieldPath,
        fieldValue,
        fieldSchema.type
      );
      if (typeError) {
        errors.push(typeError);
        continue; // Skip nested validation if type is wrong
      }

      // Validate length constraints
      const lengthError = this.validateFieldLength(
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
        const nestedResult = this.validateInternal(
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
              const itemResult = this.validateInternal(
                fieldSchema.items.properties,
                arrayValue[i] as Record<string, unknown>,
                itemPath
              );
              errors.push(...itemResult.errors);
            } else {
              const itemTypeError = this.validateFieldType(
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
  private validateFieldType(
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
        if (
          typeof value !== 'object' ||
          value === null ||
          Array.isArray(value)
        ) {
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
  private validateFieldLength(
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
        if (
          typeof value !== 'object' ||
          value === null ||
          Array.isArray(value)
        ) {
          return null; // Type validation will catch this
        }
        length = Object.keys(value).length;
        break;

      default:
        // Length validation not applicable for other types
        return null;
    }

    if (minLength !== undefined && length < minLength) {
      return `${path} must have at least ${minLength} ${this.getLengthUnit(
        fieldType,
        minLength
      )}`;
    }

    if (maxLength !== undefined && length > maxLength) {
      return `${path} must have at most ${maxLength} ${this.getLengthUnit(
        fieldType,
        maxLength
      )}`;
    }

    return null;
  }

  /**
   * Encrypts secret values in a configuration object based on a schema
   */
  private async encryptConfigValues(
    configValues: ConfigValues,
    schema: ConfigSchemaDefinition
  ): Promise<ConfigValues> {
    const encrypted = { ...configValues };

    for (const [key, value] of Object.entries(configValues)) {
      const fieldSchema = schema[key];

      if (fieldSchema?.type === 'secret' && typeof value === 'string') {
        encrypted[key] = await this.encrypt(value);
      } else if (
        // handle nested objects
        fieldSchema?.type === 'object' &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        encrypted[key] = await this.encryptConfigValues(
          value,
          fieldSchema.properties || {}
        );
      } else if (
        // handle arrays with secrets
        fieldSchema?.type === 'array' &&
        Array.isArray(value) &&
        fieldSchema.items
      ) {
        encrypted[key] = await Promise.all(
          value.map(async (item) => {
            if (
              fieldSchema.items!.type === 'secret' &&
              typeof item === 'string'
            ) {
              return this.encrypt(item);
            } else if (
              fieldSchema.items!.type === 'object' &&
              typeof item === 'object' &&
              item !== null
            ) {
              return this.encryptConfigValues(
                item,
                fieldSchema.items!.properties || {}
              );
            }
            return item;
          })
        );
      }
    }

    return encrypted;
  }

  /**
   * Decrypts secret values in a configuration object based on a schema
   */
  private async decryptConfigValues(
    configValues: ConfigValues,
    schema: ConfigSchemaDefinition
  ): Promise<ConfigValues> {
    const decrypted = { ...configValues };

    for (const [key, value] of Object.entries(configValues)) {
      const fieldSchema = schema[key];

      if (fieldSchema?.type === 'secret' && typeof value === 'string') {
        decrypted[key] = await this.decrypt(value);
      } else if (
        // handle nested objects
        fieldSchema?.type === 'object' &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        decrypted[key] = await this.decryptConfigValues(
          value,
          fieldSchema.properties || {}
        );
      } else if (
        // handle arrays with secrets
        fieldSchema?.type === 'array' &&
        Array.isArray(value) &&
        fieldSchema.items
      ) {
        decrypted[key] = await Promise.all(
          value.map(async (item) => {
            if (
              fieldSchema.items!.type === 'secret' &&
              typeof item === 'string'
            ) {
              return await this.decrypt(item);
            } else if (
              fieldSchema.items!.type === 'object' &&
              typeof item === 'object' &&
              item !== null
            ) {
              return await this.decryptConfigValues(
                item,
                fieldSchema.items!.properties || {}
              );
            }
            return item;
          })
        );
      }
    }

    return decrypted;
  }

  /**
   * Gets the appropriate unit for length validation error messages
   * @param fieldType - The field type
   * @returns The unit string (characters, items, properties)
   */
  private getLengthUnit(fieldType: string, count: number): string {
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
}
