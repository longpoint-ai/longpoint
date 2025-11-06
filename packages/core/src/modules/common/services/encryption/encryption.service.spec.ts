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
});
