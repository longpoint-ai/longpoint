import { validate } from 'class-validator';
import {
  IsValidMediaContainerPath,
  isValidMediaContainerPath,
  pathValidationConstants,
} from './media-container-path.validation.js';

describe('MediaContainerPathValidation', () => {
  describe('constants', () => {
    it('should have correct min and max length values', () => {
      expect(pathValidationConstants.MIN_PATH_LENGTH).toBe(1);
      expect(pathValidationConstants.MAX_PATH_LENGTH).toBe(500);
    });

    it('should have proper regex patterns', () => {
      expect(pathValidationConstants.ALLOWED_CHARS).toBeInstanceOf(RegExp);
      expect(pathValidationConstants.DISALLOWED_PATTERNS).toBeInstanceOf(Array);
      expect(pathValidationConstants.DISALLOWED_PATTERNS).toHaveLength(3);
    });
  });

  describe('isValidMediaContainerPath', () => {
    describe('valid paths', () => {
      it('should return true for simple valid paths', () => {
        expect(isValidMediaContainerPath('/')).toBe(true);
        expect(isValidMediaContainerPath('/projects')).toBe(true);
        expect(isValidMediaContainerPath('/projects/My Project')).toBe(true);
        expect(isValidMediaContainerPath('projects')).toBe(true);
        expect(isValidMediaContainerPath('projects/images')).toBe(true);
      });

      it('should return true for paths with various allowed characters', () => {
        expect(isValidMediaContainerPath('/projects/my-project')).toBe(true);
        expect(isValidMediaContainerPath('/projects/my_project')).toBe(true);
        expect(isValidMediaContainerPath('/projects/my.project')).toBe(true);
        expect(isValidMediaContainerPath('/projects/my (project)')).toBe(true);
        expect(isValidMediaContainerPath('/projects/my[project]')).toBe(true);
        expect(isValidMediaContainerPath('/projects/2023-images')).toBe(true);
      });

      it('should return true for paths with spaces', () => {
        expect(isValidMediaContainerPath('/projects/My Project')).toBe(true);
        expect(isValidMediaContainerPath('/My Documents')).toBe(true);
        expect(isValidMediaContainerPath('/photos/vacation photos')).toBe(true);
      });

      it('should return true for edge case lengths', () => {
        expect(isValidMediaContainerPath('a')).toBe(true); // exactly min length
        expect(isValidMediaContainerPath('a'.repeat(500))).toBe(true); // exactly max length
      });
    });

    describe('invalid paths - length constraints', () => {
      it('should return false for empty or null paths', () => {
        expect(isValidMediaContainerPath('')).toBe(false);
        expect(isValidMediaContainerPath(null as any)).toBe(false);
        expect(isValidMediaContainerPath(undefined as any)).toBe(false);
      });

      it('should return false for paths that are too long', () => {
        expect(isValidMediaContainerPath('a'.repeat(501))).toBe(false);
        expect(isValidMediaContainerPath('a'.repeat(1000))).toBe(false);
      });

      it('should return false for whitespace-only paths', () => {
        expect(isValidMediaContainerPath('   ')).toBe(false);
        expect(isValidMediaContainerPath('\t')).toBe(false);
        expect(isValidMediaContainerPath('\n')).toBe(false);
      });
    });

    describe('invalid paths - security concerns', () => {
      it('should return false for path traversal attempts', () => {
        expect(isValidMediaContainerPath('/projects/../etc')).toBe(false);
        expect(isValidMediaContainerPath('/projects/../../etc')).toBe(false);
        expect(isValidMediaContainerPath('../etc')).toBe(false);
        expect(isValidMediaContainerPath('../../etc')).toBe(false);
        expect(isValidMediaContainerPath('/projects/.../etc')).toBe(false);
      });

      it('should return false for home directory references', () => {
        expect(isValidMediaContainerPath('~/projects')).toBe(false);
        expect(isValidMediaContainerPath('/home/~')).toBe(false);
        expect(isValidMediaContainerPath('/projects/~user')).toBe(false);
      });

      it('should return false for double slashes', () => {
        expect(isValidMediaContainerPath('/projects//images')).toBe(false);
        expect(isValidMediaContainerPath('//projects')).toBe(false);
        expect(isValidMediaContainerPath('/projects//images//')).toBe(false);
      });
    });

    describe('invalid paths - character restrictions', () => {
      it('should return false for paths with disallowed special characters', () => {
        expect(isValidMediaContainerPath('/projects/my@project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my#project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my$project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my%project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my&project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my+project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my=project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my?project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my|project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my\\project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my"project')).toBe(false);
        expect(isValidMediaContainerPath("/projects/my'project")).toBe(false);
        expect(isValidMediaContainerPath('/projects/my;project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my:project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my<project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my>project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my{project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my}project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my`project')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my!project')).toBe(false);
      });

      it('should return false for paths with control characters', () => {
        expect(isValidMediaContainerPath('/projects/my\tproject')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my\nproject')).toBe(false);
        expect(isValidMediaContainerPath('/projects/my\rproject')).toBe(false);
      });
    });

    describe('edge cases and normalization', () => {
      it('should handle whitespace trimming', () => {
        expect(isValidMediaContainerPath('  /projects  ')).toBe(true);
        expect(isValidMediaContainerPath('\t/projects\t')).toBe(true);
      });

      it('should handle non-string inputs', () => {
        expect(isValidMediaContainerPath(123 as any)).toBe(false);
        expect(isValidMediaContainerPath({} as any)).toBe(false);
        expect(isValidMediaContainerPath([] as any)).toBe(false);
      });
    });
  });

  describe('IsValidMediaContainerPath decorator', () => {
    class TestClass {
      @IsValidMediaContainerPath()
      path: string;

      constructor(path: string) {
        this.path = path;
      }
    }

    it('should pass validation for valid paths', async () => {
      const testInstance = new TestClass('/projects/My Project');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for invalid paths', async () => {
      const testInstance = new TestClass('/projects/../etc');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('path');
    });

    it('should fail validation for empty paths', async () => {
      const testInstance = new TestClass('');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('path');
    });

    it('should fail validation for paths with disallowed characters', async () => {
      const testInstance = new TestClass('/projects/my@project');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('path');
    });

    it('should pass validation for root path', async () => {
      const testInstance = new TestClass('/');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for paths with spaces', async () => {
      const testInstance = new TestClass('/My Documents/Photos');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for paths with allowed special characters', async () => {
      const testInstance = new TestClass('/projects/my-project_v2.0');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(0);
    });
  });

  describe('IsValidMediaContainerPath decorator with custom validation options', () => {
    class TestClassWithCustomMessage {
      @IsValidMediaContainerPath({ message: 'Custom path validation message' })
      path: string;

      constructor(path: string) {
        this.path = path;
      }
    }

    it('should use custom validation message', async () => {
      const testInstance = new TestClassWithCustomMessage('/projects/../etc');
      const errors = await validate(testInstance);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('customValidation');
      expect(errors[0].constraints?.customValidation).toBe(
        'Custom path validation message'
      );
    });
  });

  describe('real-world path scenarios', () => {
    it('should handle common project structures', () => {
      expect(isValidMediaContainerPath('/projects')).toBe(true);
      expect(isValidMediaContainerPath('/projects/frontend')).toBe(true);
      expect(isValidMediaContainerPath('/projects/backend')).toBe(true);
      expect(isValidMediaContainerPath('/projects/docs')).toBe(true);
    });

    it('should handle media organization paths', () => {
      expect(isValidMediaContainerPath('/media')).toBe(true);
      expect(isValidMediaContainerPath('/media/photos')).toBe(true);
      expect(isValidMediaContainerPath('/media/videos')).toBe(true);
      expect(isValidMediaContainerPath('/media/thumbnails')).toBe(true);
      expect(isValidMediaContainerPath('/media/2023')).toBe(true);
      expect(isValidMediaContainerPath('/media/2023/vacation')).toBe(true);
    });

    it('should handle user-generated content paths', () => {
      expect(isValidMediaContainerPath('/uploads')).toBe(true);
      expect(isValidMediaContainerPath('/uploads/users')).toBe(true);
      expect(isValidMediaContainerPath('/uploads/temp')).toBe(true);
      expect(isValidMediaContainerPath('/uploads/avatars')).toBe(true);
    });

    it('should handle versioned content paths', () => {
      expect(isValidMediaContainerPath('/content/v1')).toBe(true);
      expect(isValidMediaContainerPath('/content/v2')).toBe(true);
      expect(isValidMediaContainerPath('/content/draft')).toBe(true);
      expect(isValidMediaContainerPath('/content/published')).toBe(true);
    });
  });
});
