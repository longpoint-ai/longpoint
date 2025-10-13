import { length, registerDecorator, ValidationOptions } from 'class-validator';

export const constants = {
  MIN_PATH_LENGTH: 1,
  MAX_PATH_LENGTH: 500,
  // Allow alphanumeric, spaces, hyphens, underscores, slashes, dots, parentheses, brackets
  ALLOWED_CHARS: /^[a-zA-Z0-9\s\-_\/\.\(\)\[\]]+$/,
  DISALLOWED_PATTERNS: [
    /\.\./, // Path traversal
    /~/, // Home directory reference
    /\/\//, // Double slashes
  ],
};

export const isValidMediaContainerPath = (path: string) => {
  if (!path || typeof path !== 'string') {
    return false;
  }

  const normalizedPath = path.trim();

  if (
    !length(
      normalizedPath,
      constants.MIN_PATH_LENGTH,
      constants.MAX_PATH_LENGTH
    )
  ) {
    return false;
  }

  // Check for disallowed patterns
  for (const pattern of constants.DISALLOWED_PATTERNS) {
    if (pattern.test(normalizedPath)) {
      return false;
    }
  }

  // Check allowed characters (including control characters check)
  if (!constants.ALLOWED_CHARS.test(normalizedPath)) {
    return false;
  }

  // Check for control characters specifically
  if (/[\x00-\x1F\x7F]/.test(normalizedPath)) {
    return false;
  }

  // Additional security checks
  // Prevent absolute paths that could escape the intended directory
  if (normalizedPath.startsWith('/') && normalizedPath !== '/') {
    // Allow root path but not absolute paths that could be problematic
    const pathSegments = normalizedPath
      .split('/')
      .filter((segment) => segment.length > 0);
    for (const segment of pathSegments) {
      // Each segment should be valid
      if (!/^[a-zA-Z0-9\s\-_\.\(\)\[\]]+$/.test(segment)) {
        return false;
      }
    }
  }

  return true;
};

export const IsValidMediaContainerPath = (
  validationOptions?: ValidationOptions
) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: isValidMediaContainerPath },
    });
  };
};
