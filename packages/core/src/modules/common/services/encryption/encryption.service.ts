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

  private deriveKey(): Buffer {
    const secret = this.configService.get('encryption.secret');
    const salt = Buffer.from('longpoint-encryption-salt', 'utf-8');
    return crypto.pbkdf2Sync(secret, salt, 100000, this.keyLength, 'sha256');
  }
}
