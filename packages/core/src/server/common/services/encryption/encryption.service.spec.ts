import { ConfigSchema, ConfigValues } from '@longpoint/devkit';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../config/config.service';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((path) => {
              if (path === 'encryption.secret') {
                return 'test-encryption-secret';
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('basic encryption/decryption', () => {
    it('should encrypt and decrypt data', () => {
      const data = 'test-data';
      const encrypted = service.encrypt(data);
      expect(encrypted).not.toBe(data);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(data);
    });

    it('should handle empty strings', () => {
      const data = '';
      const encrypted = service.encrypt(data);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(data);
    });

    it('should produce different encrypted values for same input', () => {
      const data = 'test-data';
      const encrypted1 = service.encrypt(data);
      const encrypted2 = service.encrypt(data);
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same value
      expect(service.decrypt(encrypted1)).toBe(data);
      expect(service.decrypt(encrypted2)).toBe(data);
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => service.decrypt('invalid-data')).toThrow(
        'Failed to decrypt data'
      );
    });
  });

  describe('encryptConfigValues', () => {
    it('should encrypt secret fields only', () => {
      const configValues: ConfigValues = {
        apiKey: 'sk-1234567890abcdef',
        model: 'claude-3-sonnet',
        temperature: 0.7,
      };

      const schema: ConfigSchema = {
        apiKey: { type: 'secret', label: 'API Key' },
        model: { type: 'string', label: 'Model' },
        temperature: { type: 'number', label: 'Temperature' },
      };

      const encrypted = service.encryptConfigValues(configValues, schema);

      expect(encrypted.apiKey).not.toBe(configValues.apiKey);
      expect(encrypted.model).toBe(configValues.model);
      expect(encrypted.temperature).toBe(configValues.temperature);
    });

    it('should handle nested objects with secrets', () => {
      const configValues: ConfigValues = {
        provider: {
          apiKey: 'sk-1234567890abcdef',
          name: 'anthropic',
        },
        enabled: true,
      };

      const schema: ConfigSchema = {
        provider: {
          type: 'object',
          label: 'Provider',
          properties: {
            apiKey: { type: 'secret', label: 'API Key' },
            name: { type: 'string', label: 'Name' },
          },
        },
        enabled: { type: 'boolean', label: 'Enabled' },
      };

      const encrypted = service.encryptConfigValues(configValues, schema);

      expect(encrypted.provider.apiKey).not.toBe(configValues.provider.apiKey);
      expect(encrypted.provider.name).toBe(configValues.provider.name);
      expect(encrypted.enabled).toBe(configValues.enabled);
    });

    it('should handle arrays of secrets', () => {
      const configValues: ConfigValues = {
        apiKeys: ['sk-key1', 'sk-key2', 'sk-key3'],
        models: ['claude-3-sonnet', 'claude-3-haiku'],
      };

      const schema: ConfigSchema = {
        apiKeys: {
          type: 'array',
          label: 'API Keys',
          items: { type: 'secret' },
        },
        models: {
          type: 'array',
          label: 'Models',
          items: { type: 'string' },
        },
      };

      const encrypted = service.encryptConfigValues(configValues, schema);

      expect(encrypted.apiKeys[0]).not.toBe(configValues.apiKeys[0]);
      expect(encrypted.apiKeys[1]).not.toBe(configValues.apiKeys[1]);
      expect(encrypted.apiKeys[2]).not.toBe(configValues.apiKeys[2]);

      // Models should remain unchanged
      expect(encrypted.models).toEqual(configValues.models);
    });

    it('should handle arrays of objects with secrets', () => {
      const configValues: ConfigValues = {
        providers: [
          { apiKey: 'sk-key1', name: 'provider1' },
          { apiKey: 'sk-key2', name: 'provider2' },
        ],
        settings: { enabled: true },
      };

      const schema: ConfigSchema = {
        providers: {
          type: 'array',
          label: 'Providers',
          items: {
            type: 'object',
            properties: {
              apiKey: { type: 'secret', label: 'API Key' },
              name: { type: 'string', label: 'Name' },
            },
          },
        },
        settings: {
          type: 'object',
          label: 'Settings',
          properties: {
            enabled: { type: 'boolean', label: 'Enabled' },
          },
        },
      };

      const encrypted = service.encryptConfigValues(configValues, schema);

      // API keys should be encrypted
      expect(encrypted.providers[0].apiKey).not.toBe(
        configValues.providers[0].apiKey
      );
      expect(encrypted.providers[1].apiKey).not.toBe(
        configValues.providers[1].apiKey
      );

      // Names should remain unchanged
      expect(encrypted.providers[0].name).toBe(configValues.providers[0].name);
      expect(encrypted.providers[1].name).toBe(configValues.providers[1].name);

      // Settings should remain unchanged
      expect(encrypted.settings).toEqual(configValues.settings);
    });

    it('should handle mixed array types', () => {
      const configValues: ConfigValues = {
        mixedArray: [
          'plain-string',
          { secret: 'sk-secret', public: 'public-value' },
          'another-plain-string',
        ],
      };

      const schema: ConfigSchema = {
        mixedArray: {
          type: 'array',
          label: 'Mixed Array',
          items: {
            type: 'object',
            properties: {
              secret: { type: 'secret', label: 'Secret' },
              public: { type: 'string', label: 'Public' },
            },
          },
        },
      };

      const encrypted = service.encryptConfigValues(configValues, schema);

      // Plain strings should remain unchanged
      expect(encrypted.mixedArray[0]).toBe(configValues.mixedArray[0]);
      expect(encrypted.mixedArray[2]).toBe(configValues.mixedArray[2]);

      // Object with secret should have secret encrypted
      expect(encrypted.mixedArray[1].secret).not.toBe(
        configValues.mixedArray[1].secret
      );
      expect(encrypted.mixedArray[1].public).toBe(
        configValues.mixedArray[1].public
      );
    });
  });

  describe('decryptConfigValues', () => {
    it('should decrypt secret fields only', () => {
      const configValues: ConfigValues = {
        apiKey: 'sk-1234567890abcdef',
        model: 'claude-3-sonnet',
        temperature: 0.7,
      };

      const schema: ConfigSchema = {
        apiKey: { type: 'secret', label: 'API Key' },
        model: { type: 'string', label: 'Model' },
        temperature: { type: 'number', label: 'Temperature' },
      };

      // First encrypt
      const encrypted = service.encryptConfigValues(configValues, schema);

      // Then decrypt
      const decrypted = service.decryptConfigValues(encrypted, schema);

      expect(decrypted.apiKey).toBe(configValues.apiKey);
      expect(decrypted.model).toBe(configValues.model);
      expect(decrypted.temperature).toBe(configValues.temperature);
    });

    it('should handle nested objects with secrets', () => {
      const configValues: ConfigValues = {
        provider: {
          apiKey: 'sk-1234567890abcdef',
          name: 'anthropic',
        },
        enabled: true,
      };

      const schema: ConfigSchema = {
        provider: {
          type: 'object',
          label: 'Provider',
          properties: {
            apiKey: { type: 'secret', label: 'API Key' },
            name: { type: 'string', label: 'Name' },
          },
        },
        enabled: { type: 'boolean', label: 'Enabled' },
      };

      // First encrypt
      const encrypted = service.encryptConfigValues(configValues, schema);

      // Then decrypt
      const decrypted = service.decryptConfigValues(encrypted, schema);

      expect(decrypted.provider.apiKey).toBe(configValues.provider.apiKey);
      expect(decrypted.provider.name).toBe(configValues.provider.name);
      expect(decrypted.enabled).toBe(configValues.enabled);
    });

    it('should handle arrays of secrets', () => {
      const configValues: ConfigValues = {
        apiKeys: ['sk-key1', 'sk-key2', 'sk-key3'],
        models: ['claude-3-sonnet', 'claude-3-haiku'],
      };

      const schema: ConfigSchema = {
        apiKeys: {
          type: 'array',
          label: 'API Keys',
          items: { type: 'secret' },
        },
        models: {
          type: 'array',
          label: 'Models',
          items: { type: 'string' },
        },
      };

      // First encrypt
      const encrypted = service.encryptConfigValues(configValues, schema);

      // Then decrypt
      const decrypted = service.decryptConfigValues(encrypted, schema);

      expect(decrypted.apiKeys).toEqual(configValues.apiKeys);
      expect(decrypted.models).toEqual(configValues.models);
    });

    it('should handle arrays of objects with secrets', () => {
      const configValues: ConfigValues = {
        providers: [
          { apiKey: 'sk-key1', name: 'provider1' },
          { apiKey: 'sk-key2', name: 'provider2' },
        ],
        settings: { enabled: true },
      };

      const schema: ConfigSchema = {
        providers: {
          type: 'array',
          label: 'Providers',
          items: {
            type: 'object',
            properties: {
              apiKey: { type: 'secret', label: 'API Key' },
              name: { type: 'string', label: 'Name' },
            },
          },
        },
        settings: {
          type: 'object',
          label: 'Settings',
          properties: {
            enabled: { type: 'boolean', label: 'Enabled' },
          },
        },
      };

      // First encrypt
      const encrypted = service.encryptConfigValues(configValues, schema);

      // Then decrypt
      const decrypted = service.decryptConfigValues(encrypted, schema);

      expect(decrypted.providers).toEqual(configValues.providers);
      expect(decrypted.settings).toEqual(configValues.settings);
    });

    it('should handle complex nested structures', () => {
      const configValues: ConfigValues = {
        providers: [
          {
            name: 'anthropic',
            config: {
              apiKey: 'sk-anthropic-key',
              models: ['claude-3-sonnet', 'claude-3-haiku'],
            },
          },
          {
            name: 'openai',
            config: {
              apiKey: 'sk-openai-key',
              models: ['gpt-4', 'gpt-3.5-turbo'],
            },
          },
        ],
        globalSettings: {
          enabled: true,
          secretToken: 'global-secret-token',
        },
      };

      const schema: ConfigSchema = {
        providers: {
          type: 'array',
          label: 'Providers',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', label: 'Name' },
              config: {
                type: 'object',
                label: 'Config',
                properties: {
                  apiKey: { type: 'secret', label: 'API Key' },
                  models: {
                    type: 'array',
                    label: 'Models',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        globalSettings: {
          type: 'object',
          label: 'Global Settings',
          properties: {
            enabled: { type: 'boolean', label: 'Enabled' },
            secretToken: { type: 'secret', label: 'Secret Token' },
          },
        },
      };

      // First encrypt
      const encrypted = service.encryptConfigValues(configValues, schema);

      // Then decrypt
      const decrypted = service.decryptConfigValues(encrypted, schema);

      expect(decrypted).toEqual(configValues);
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined values', () => {
      const configValues: ConfigValues = {
        secret: 'test-secret',
        nullValue: null,
        undefinedValue: undefined,
      };

      const schema: ConfigSchema = {
        secret: { type: 'secret', label: 'Secret' },
        nullValue: { type: 'string', label: 'Null Value' },
        undefinedValue: { type: 'string', label: 'Undefined Value' },
      };

      const encrypted = service.encryptConfigValues(configValues, schema);
      const decrypted = service.decryptConfigValues(encrypted, schema);

      expect(decrypted.secret).toBe(configValues.secret);
      expect(decrypted.nullValue).toBe(configValues.nullValue);
      expect(decrypted.undefinedValue).toBe(configValues.undefinedValue);
    });

    it('should handle empty arrays', () => {
      const configValues: ConfigValues = {
        emptySecretArray: [],
        emptyStringArray: [],
      };

      const schema: ConfigSchema = {
        emptySecretArray: {
          type: 'array',
          label: 'Empty Secret Array',
          items: { type: 'secret' },
        },
        emptyStringArray: {
          type: 'array',
          label: 'Empty String Array',
          items: { type: 'string' },
        },
      };

      const encrypted = service.encryptConfigValues(configValues, schema);
      const decrypted = service.decryptConfigValues(encrypted, schema);

      expect(decrypted).toEqual(configValues);
    });

    it('should handle arrays with mixed object types', () => {
      const configValues: ConfigValues = {
        mixedArray: [
          'string-item',
          { secret: 'sk-secret', public: 'public' },
          { onlyPublic: 'no-secrets' },
        ],
      };

      const schema: ConfigSchema = {
        mixedArray: {
          type: 'array',
          label: 'Mixed Array',
          items: {
            type: 'object',
            properties: {
              secret: { type: 'secret', label: 'Secret' },
              public: { type: 'string', label: 'Public' },
              onlyPublic: { type: 'string', label: 'Only Public' },
            },
          },
        },
      };

      const encrypted = service.encryptConfigValues(configValues, schema);
      const decrypted = service.decryptConfigValues(encrypted, schema);

      expect(decrypted).toEqual(configValues);
    });
  });
});
