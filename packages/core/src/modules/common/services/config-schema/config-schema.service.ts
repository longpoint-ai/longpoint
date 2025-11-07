import { InvalidInput } from '@/shared/errors';
import { ConfigSchema, ConfigSchemaDefinition } from '@longpoint/config-schema';
import { Injectable, Logger } from '@nestjs/common';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class ConfigSchemaService {
  private readonly logger = new Logger(ConfigSchemaService.name);

  constructor(private readonly encryptionService: EncryptionService) {}

  get(schema: ConfigSchemaDefinition = {}): ConfigSchema {
    return new ConfigSchema(schema, {
      encrypt: (value: string) => this.encryptionService.encrypt(value),
      decrypt: async (value: string) => {
        try {
          return await this.encryptionService.decrypt(value);
        } catch (error) {
          this.logger.warn(`Failed to decrypt value, returning as is!`);
          return value;
        }
      },
      validationErrorClass: InvalidInput,
    });
  }
}
