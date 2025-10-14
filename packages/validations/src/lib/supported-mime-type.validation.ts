import { SupportedMimeType } from '@longpoint/types';
import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Checks if a mime type is supported
 * @param mimeType
 * @returns true if the mime type is supported, false otherwise
 */
export function isSupportedMimeType(
  mimeType: string
): mimeType is SupportedMimeType {
  return Object.values(SupportedMimeType).includes(
    mimeType as SupportedMimeType
  );
}

export const IsSupportedMimeType = (validationOptions?: ValidationOptions) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: isSupportedMimeType },
    });
  };
};
