import { InvalidInput } from '@/shared/errors';
import { ConfigSchema, ConfigSchemaDefinition } from '@longpoint/config-schema';
import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class ConfigSchemaService {
  constructor(private readonly encryptionService: EncryptionService) {}

  get(schema: ConfigSchemaDefinition = {}): ConfigSchema {
    return new ConfigSchema(schema, {
      encrypt: (value: string) => this.encryptionService.encrypt(value),
      decrypt: (value: string) => this.encryptionService.decrypt(value),
      validationErrorClass: InvalidInput,
    });
  }
}
