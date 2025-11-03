import { SupportedMimeType } from '@longpoint/types';
import { validate } from 'class-validator';
import {
  IsSupportedMimeType,
  isSupportedMimeType,
} from './supported-mime-type.validation.js';

describe('isSupportedMimeType', () => {
  describe('when given a supported mime type', () => {
    it('should return true for image/jpg', () => {
      expect(isSupportedMimeType('image/jpg')).toBe(true);
    });

    it('should return true for image/jpeg', () => {
      expect(isSupportedMimeType('image/jpeg')).toBe(true);
    });

    it('should return true for image/png', () => {
      expect(isSupportedMimeType('image/png')).toBe(true);
    });

    it('should return true for image/gif', () => {
      expect(isSupportedMimeType('image/gif')).toBe(true);
    });

    it('should return true for image/webp', () => {
      expect(isSupportedMimeType('image/webp')).toBe(true);
    });

    it('should return true for all supported mime types', () => {
      Object.values(SupportedMimeType).forEach((mimeType) => {
        expect(isSupportedMimeType(mimeType)).toBe(true);
      });
    });
  });

  describe('when given an unsupported mime type', () => {
    it('should return false for image/svg+xml', () => {
      expect(isSupportedMimeType('image/svg+xml')).toBe(false);
    });

    it('should return false for video/mp4', () => {
      expect(isSupportedMimeType('video/mp4')).toBe(false);
    });

    it('should return false for text/plain', () => {
      expect(isSupportedMimeType('text/plain')).toBe(false);
    });

    it('should return false for audio/mpeg', () => {
      expect(isSupportedMimeType('audio/mpeg')).toBe(false);
    });

    it('should return false for application/json', () => {
      expect(isSupportedMimeType('application/json')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isSupportedMimeType('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isSupportedMimeType(null as any)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isSupportedMimeType(undefined as any)).toBe(false);
    });

    it('should return false for invalid mime type format', () => {
      expect(isSupportedMimeType('invalid-mime-type')).toBe(false);
    });

    it('should return false for case variations', () => {
      expect(isSupportedMimeType('IMAGE/JPEG')).toBe(false);
      expect(isSupportedMimeType('Image/Jpeg')).toBe(false);
    });
  });

  describe('type narrowing', () => {
    it('should narrow the type correctly for supported mime types', () => {
      const mimeType = 'image/jpeg';

      if (isSupportedMimeType(mimeType)) {
        // This should compile without errors
        const supportedMimeType: SupportedMimeType = mimeType;
        expect(supportedMimeType).toBe('image/jpeg');
      }
    });
  });
});

describe('IsSupportedMimeType decorator', () => {
  class TestClass {
    @IsSupportedMimeType()
    mimeType!: string;
  }

  class TestClassWithCustomMessage {
    @IsSupportedMimeType({ message: 'Custom error message' })
    mimeType!: string;
  }

  describe('when validating supported mime types', () => {
    it('should pass validation for image/jpg', async () => {
      const testObject = new TestClass();
      testObject.mimeType = 'image/jpg';

      const errors = await validate(testObject);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for image/jpeg', async () => {
      const testObject = new TestClass();
      testObject.mimeType = 'image/jpeg';

      const errors = await validate(testObject);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for image/png', async () => {
      const testObject = new TestClass();
      testObject.mimeType = 'image/png';

      const errors = await validate(testObject);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for image/gif', async () => {
      const testObject = new TestClass();
      testObject.mimeType = 'image/gif';

      const errors = await validate(testObject);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for image/webp', async () => {
      const testObject = new TestClass();
      testObject.mimeType = 'image/webp';

      const errors = await validate(testObject);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for all supported mime types', async () => {
      for (const mimeType of Object.values(SupportedMimeType)) {
        const testObject = new TestClass();
        testObject.mimeType = mimeType;

        const errors = await validate(testObject);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('when validating unsupported mime types', () => {
    it('should fail validation for image/svg+xml', async () => {
      const testObject = new TestClass();
      testObject.mimeType = 'image/svg+xml';

      const errors = await validate(testObject);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('mimeType');
      expect(errors[0].constraints).toHaveProperty('customValidation');
    });

    it('should fail validation for video/mp4', async () => {
      const testObject = new TestClass();
      testObject.mimeType = 'video/mp4';

      const errors = await validate(testObject);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('mimeType');
      expect(errors[0].constraints).toHaveProperty('customValidation');
    });

    it('should fail validation for text/plain', async () => {
      const testObject = new TestClass();
      testObject.mimeType = 'text/plain';

      const errors = await validate(testObject);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('mimeType');
      expect(errors[0].constraints).toHaveProperty('customValidation');
    });

    it('should fail validation for empty string', async () => {
      const testObject = new TestClass();
      testObject.mimeType = '';

      const errors = await validate(testObject);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('mimeType');
      expect(errors[0].constraints).toHaveProperty('customValidation');
    });

    it('should fail validation for null', async () => {
      const testObject = new TestClass();
      testObject.mimeType = null as any;

      const errors = await validate(testObject);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('mimeType');
      expect(errors[0].constraints).toHaveProperty('customValidation');
    });

    it('should fail validation for undefined', async () => {
      const testObject = new TestClass();
      testObject.mimeType = undefined as any;

      const errors = await validate(testObject);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('mimeType');
      expect(errors[0].constraints).toHaveProperty('customValidation');
    });
  });

  describe('custom validation options', () => {
    it('should use custom error message when provided', async () => {
      const testObject = new TestClassWithCustomMessage();
      testObject.mimeType = 'unsupported/mime-type';

      const errors = await validate(testObject);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('mimeType');
      expect(errors[0].constraints).toHaveProperty('customValidation');
      expect(errors[0].constraints?.customValidation).toBe(
        'Custom error message'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle case sensitivity correctly', async () => {
      const testObject = new TestClass();
      testObject.mimeType = 'IMAGE/JPEG';

      const errors = await validate(testObject);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('mimeType');
      expect(errors[0].constraints).toHaveProperty('customValidation');
    });

    it('should handle whitespace correctly', async () => {
      const testObject = new TestClass();
      testObject.mimeType = ' image/jpeg ';

      const errors = await validate(testObject);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('mimeType');
      expect(errors[0].constraints).toHaveProperty('customValidation');
    });
  });
});
