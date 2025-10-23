import { ConfigSchema } from '@longpoint/devkit';
import { validateConfigSchema } from './config-schema.validation';

describe('validateConfigSchema', () => {
  describe('required field validation', () => {
    it('should pass when all required fields are provided', () => {
      const schema: ConfigSchema = {
        name: {
          label: 'Name',
          type: 'string',
          required: true,
        },
        description: {
          label: 'Description',
          type: 'string',
          required: false,
        },
      };

      const values = {
        name: 'Test Name',
        description: 'Test Description',
      };

      const result = validateConfigSchema(schema, values);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when required fields are missing', () => {
      const schema: ConfigSchema = {
        name: {
          label: 'Name',
          type: 'string',
          required: true,
        },
        description: {
          label: 'Description',
          type: 'string',
          required: false,
        },
      };

      const values = {
        description: 'Test Description',
      };

      const result = validateConfigSchema(schema, values);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('should fail when required fields are empty strings', () => {
      const schema: ConfigSchema = {
        name: {
          label: 'Name',
          type: 'string',
          required: true,
        },
      };

      const values = {
        name: '',
      };

      const result = validateConfigSchema(schema, values);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });
  });

  describe('type validation', () => {
    it('should validate string types', () => {
      const schema: ConfigSchema = {
        name: {
          label: 'Name',
          type: 'string',
        },
      };

      const validResult = validateConfigSchema(schema, { name: 'test' });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateConfigSchema(schema, { name: 123 });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('name must be a string');
    });

    it('should validate number types', () => {
      const schema: ConfigSchema = {
        count: {
          label: 'Count',
          type: 'number',
        },
      };

      const validResult = validateConfigSchema(schema, { count: 42 });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateConfigSchema(schema, {
        count: 'not a number',
      });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('count must be a number');
    });

    it('should validate boolean types', () => {
      const schema: ConfigSchema = {
        enabled: {
          label: 'Enabled',
          type: 'boolean',
        },
      };

      const validResult = validateConfigSchema(schema, { enabled: true });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateConfigSchema(schema, { enabled: 'true' });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('enabled must be a boolean');
    });

    it('should validate array types', () => {
      const schema: ConfigSchema = {
        items: {
          label: 'Items',
          type: 'array',
        },
      };

      const validResult = validateConfigSchema(schema, { items: [1, 2, 3] });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateConfigSchema(schema, {
        items: 'not an array',
      });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('items must be an array');
    });

    it('should validate object types', () => {
      const schema: ConfigSchema = {
        config: {
          label: 'Config',
          type: 'object',
        },
      };

      const validResult = validateConfigSchema(schema, {
        config: { key: 'value' },
      });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateConfigSchema(schema, {
        config: 'not an object',
      });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('config must be an object');
    });

    it('should validate secret types as strings', () => {
      const schema: ConfigSchema = {
        apiKey: {
          label: 'API Key',
          type: 'secret',
        },
      };

      const validResult = validateConfigSchema(schema, { apiKey: 'secret123' });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateConfigSchema(schema, { apiKey: 123 });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('apiKey must be a string');
    });
  });

  describe('nested object validation', () => {
    it('should validate nested object properties', () => {
      const schema: ConfigSchema = {
        user: {
          label: 'User',
          type: 'object',
          properties: {
            name: {
              label: 'Name',
              type: 'string',
              required: true,
            },
            age: {
              label: 'Age',
              type: 'number',
            },
          },
        },
      };

      const validResult = validateConfigSchema(schema, {
        user: {
          name: 'John',
          age: 30,
        },
      });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateConfigSchema(schema, {
        user: {
          age: 'not a number',
        },
      });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('user.name is required');
      expect(invalidResult.errors).toContain('user.age must be a number');
    });
  });

  describe('array item validation', () => {
    it('should validate array items with primitive types', () => {
      const schema: ConfigSchema = {
        tags: {
          label: 'Tags',
          type: 'array',
          items: {
            type: 'string',
          },
        },
      };

      const validResult = validateConfigSchema(schema, {
        tags: ['tag1', 'tag2', 'tag3'],
      });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateConfigSchema(schema, {
        tags: ['tag1', 123, 'tag3'],
      });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('tags[1] must be a string');
    });

    it('should validate array items with object types', () => {
      const schema: ConfigSchema = {
        fieldCapture: {
          label: 'Fields to capture',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                label: 'Name',
                type: 'string',
                required: true,
              },
              instructions: {
                label: 'Instructions',
                type: 'string',
              },
            },
          },
        },
      };

      const validResult = validateConfigSchema(schema, {
        fieldCapture: [
          {
            name: 'field1',
            instructions: 'Capture field 1',
          },
          {
            name: 'field2',
          },
        ],
      });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateConfigSchema(schema, {
        fieldCapture: [
          {
            name: 'field1',
            instructions: 'Capture field 1',
          },
          {
            instructions: 'Missing name',
          },
        ],
      });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain(
        'fieldCapture[1].name is required'
      );
    });
  });

  describe('unknown field rejection', () => {
    it('should reject unknown fields', () => {
      const schema: ConfigSchema = {
        name: {
          label: 'Name',
          type: 'string',
        },
      };

      const result = validateConfigSchema(schema, {
        name: 'Test',
        unknownField: 'Should be rejected',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'unknownField is not defined in the schema'
      );
    });

    it('should reject unknown fields in nested objects', () => {
      const schema: ConfigSchema = {
        user: {
          label: 'User',
          type: 'object',
          properties: {
            name: {
              label: 'Name',
              type: 'string',
            },
          },
        },
      };

      const result = validateConfigSchema(schema, {
        user: {
          name: 'John',
          unknownField: 'Should be rejected',
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'user.unknownField is not defined in the schema'
      );
    });
  });

  describe('complex validation scenarios', () => {
    it('should validate the anthropic classifier schema example', () => {
      const schema: ConfigSchema = {
        fieldCapture: {
          label: 'Fields to capture',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                label: 'Name',
                type: 'string',
                description: 'The name of the field to capture',
                required: true,
              },
              instructions: {
                label: 'Instructions',
                type: 'string',
                description: 'Instructions for filling the field',
              },
            },
          },
        },
      };

      const validResult = validateConfigSchema(schema, {
        fieldCapture: [
          {
            name: 'person',
            instructions: 'Extract person names',
          },
          {
            name: 'location',
            instructions: 'Extract location names',
          },
        ],
      });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateConfigSchema(schema, {
        fieldCapture: [
          {
            instructions: 'Missing name',
          },
          {
            name: 123, // Wrong type
            instructions: 'Extract location names',
          },
        ],
      });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain(
        'fieldCapture[0].name is required'
      );
      expect(invalidResult.errors).toContain(
        'fieldCapture[1].name must be a string'
      );
    });
  });
});
