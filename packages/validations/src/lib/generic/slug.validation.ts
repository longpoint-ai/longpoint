import { registerDecorator, ValidationOptions } from 'class-validator';

export const slugConstants = {
  SLUG_REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  SLUG_ERROR_MESSAGE:
    'Must be a valid slug - Starts with a lowercase letter and contains only lowercase letters, numbers, and hyphens',
};

/**
 * Checks if a string is a valid slug
 *
 * A slug is a string that starts with a lowercase letter and contains only lowercase letters, numbers, and hyphens
 * @param slug
 * @returns true if the string is a valid slug, false otherwise
 * @example
 * isSlug('hello-world-2') // true
 * isSlug('hello world') // false
 * isSlug('-hello-world') // false
 * isSlug('hello-world-123-abc-') // false
 */
export const isSlug = (slug: string) => {
  return slugConstants.SLUG_REGEX.test(slug);
};

export const IsSlug = (validationOptions?: ValidationOptions) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: isSlug,
        defaultMessage: () => slugConstants.SLUG_ERROR_MESSAGE,
      },
    });
  };
};
