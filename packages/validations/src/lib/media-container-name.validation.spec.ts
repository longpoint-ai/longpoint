import { validate } from 'class-validator';
import {
  IsValidMediaContainerName,
  isValidMediaContainerName,
  mediaContainerNameConstants,
} from './media-container-name.validation.js';

describe('MediaContainerNameValidation', () => {
  describe('constants', () => {
    it('should have correct min and max length values', () => {
      expect(mediaContainerNameConstants.MIN_NAME_LENGTH).toBe(2);
      expect(mediaContainerNameConstants.MAX_NAME_LENGTH).toBe(255);
    });
  });

  describe('isValidMediaContainerName', () => {
    it('should return true for valid names within length limits', () => {
      expect(isValidMediaContainerName('ab')).toBe(true);
      expect(isValidMediaContainerName('valid name')).toBe(true);
      expect(isValidMediaContainerName('a'.repeat(255))).toBe(true);
    });

    it('should return false for names that are too short', () => {
      expect(isValidMediaContainerName('')).toBe(false);
      expect(isValidMediaContainerName('a')).toBe(false);
    });

    it('should return false for names that are too long', () => {
      expect(isValidMediaContainerName('a'.repeat(256))).toBe(false);
      expect(isValidMediaContainerName('a'.repeat(300))).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidMediaContainerName('a'.repeat(2))).toBe(true); // exactly min length
      expect(isValidMediaContainerName('a'.repeat(255))).toBe(true); // exactly max length
    });
  });

  describe('IsValidMediaContainerName decorator', () => {
    class TestClass {
      @IsValidMediaContainerName()
      name: string;

      constructor(name: string) {
        this.name = name;
      }
    }

    it('should pass validation for valid names', async () => {
      const testInstance = new TestClass('valid name');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for names that are too short', async () => {
      const testInstance = new TestClass('a');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation for names that are too long', async () => {
      const testInstance = new TestClass('a'.repeat(256));
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should pass validation for names at exact length boundaries', async () => {
      const minLengthInstance = new TestClass('ab');
      const maxLengthInstance = new TestClass('a'.repeat(255));

      const minErrors = await validate(minLengthInstance);
      const maxErrors = await validate(maxLengthInstance);

      expect(minErrors).toHaveLength(0);
      expect(maxErrors).toHaveLength(0);
    });

    it('should handle empty string', async () => {
      const testInstance = new TestClass('');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should handle names with special characters', async () => {
      const testInstance = new TestClass('valid-name_with.special@chars!');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('should handle names with spaces', async () => {
      const testInstance = new TestClass('valid name with spaces');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('should handle names with unicode characters', async () => {
      const testInstance = new TestClass('valid name with émojis 🎉');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });
  });

  describe('IsValidMediaContainerName decorator with custom validation options', () => {
    class TestClassWithCustomMessage {
      @IsValidMediaContainerName({ message: 'Custom validation message' })
      name: string;

      constructor(name: string) {
        this.name = name;
      }
    }

    it('should use custom validation message', async () => {
      const testInstance = new TestClassWithCustomMessage('a');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('customValidation');
      expect(errors[0].constraints?.customValidation).toBe(
        'Custom validation message'
      );
    });
  });
});
