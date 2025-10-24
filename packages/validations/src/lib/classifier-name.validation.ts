import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import z from 'zod';
import { isSlug, slugConstants } from './generic/slug.validation.js';

export const constants = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 255,
};

export const classifierNameSchema = z
  .string()
  .min(constants.MIN_NAME_LENGTH)
  .max(constants.MAX_NAME_LENGTH)
  .refine(isSlug, {
    error: slugConstants.SLUG_ERROR_MESSAGE,
  });

export const isClassifierName = (name: string) => {
  return classifierNameSchema.safeParse(name).success;
};

export const IsClassifierName = (validationOptions?: ValidationOptions) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: isClassifierName,
        defaultMessage: (validationArguments: ValidationArguments) => {
          const error = classifierNameSchema.safeParse(
            validationArguments.value
          ).error;
          return error?.message ?? 'Invalid classifier name';
        },
      },
    });
  };
};
