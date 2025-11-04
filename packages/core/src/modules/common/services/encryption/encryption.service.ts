import { ConfigSchema, ConfigValues } from '@longpoint/devkit';
import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { ConfigService } from '../config/config.service';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Encrypts a string value
   * @param data - The data to encrypt
   * @returns The encrypted data
   */
  encrypt(data: string): string {
    const key = this.deriveKey();
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    cipher.setAAD(Buffer.from('longpoint-config', 'utf8'));

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, 'hex')]);
    return combined.toString('base64');
  }

  /**
   * Decrypts a string value
   * @param encryptedData - The encrypted data to decrypt
   * @returns The decrypted data
   * @throws An error if the decryption fails
   */
  decrypt(encryptedData: string): string {
    try {
      const key = this.deriveKey();
      const combined = Buffer.from(encryptedData, 'base64');

      const iv = combined.subarray(0, this.ivLength);
      const tag = combined.subarray(
        this.ivLength,
        this.ivLength + this.tagLength
      );
      const encrypted = combined.subarray(this.ivLength + this.tagLength);

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAAD(Buffer.from('longpoint-config', 'utf8'));
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(
        `Failed to decrypt data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Encrypts secret values in a configuration object based on a schema
   */
  encryptConfigValues(
    configValues: ConfigValues,
    schema: ConfigSchema
  ): ConfigValues {
    const encrypted = { ...configValues };

    for (const [key, value] of Object.entries(configValues)) {
      const fieldSchema = schema[key];

      if (fieldSchema?.type === 'secret' && typeof value === 'string') {
        encrypted[key] = this.encrypt(value);
      } else if (
        // handle nested objects
        fieldSchema?.type === 'object' &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        encrypted[key] = this.encryptConfigValues(
          value,
          fieldSchema.properties || {}
        );
      } else if (
        // handle arrays with secrets
        fieldSchema?.type === 'array' &&
        Array.isArray(value) &&
        fieldSchema.items
      ) {
        encrypted[key] = value.map((item) => {
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
        });
      }
    }

    return encrypted;
  }

  /**
   * Decrypts secret values in a configuration object based on a schema
   */
  decryptConfigValues(
    configValues: ConfigValues,
    schema: ConfigSchema
  ): ConfigValues {
    const decrypted = { ...configValues };

    for (const [key, value] of Object.entries(configValues)) {
      const fieldSchema = schema[key];

      if (fieldSchema?.type === 'secret' && typeof value === 'string') {
        decrypted[key] = this.decrypt(value);
      } else if (
        // handle nested objects
        fieldSchema?.type === 'object' &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        decrypted[key] = this.decryptConfigValues(
          value,
          fieldSchema.properties || {}
        );
      } else if (
        // handle arrays with secrets
        fieldSchema?.type === 'array' &&
        Array.isArray(value) &&
        fieldSchema.items
      ) {
        decrypted[key] = value.map((item) => {
          if (
            fieldSchema.items!.type === 'secret' &&
            typeof item === 'string'
          ) {
            return this.decrypt(item);
          } else if (
            fieldSchema.items!.type === 'object' &&
            typeof item === 'object' &&
            item !== null
          ) {
            return this.decryptConfigValues(
              item,
              fieldSchema.items!.properties || {}
            );
          }
          return item;
        });
      }
    }

    return decrypted;
  }

  private deriveKey(): Buffer {
    const secret = this.configService.get('encryption.secret');
    const salt = Buffer.from('longpoint-encryption-salt', 'utf-8');
    return crypto.pbkdf2Sync(secret, salt, 100000, this.keyLength, 'sha256');
  }
}
