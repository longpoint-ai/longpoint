import { length, registerDecorator, ValidationOptions } from 'class-validator';

export const constants = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 255,
};

export const isValidMediaContainerName = (name: string) => {
  return length(name, constants.MIN_NAME_LENGTH, constants.MAX_NAME_LENGTH);
};

export const IsValidMediaContainerName = (
  validationOptions?: ValidationOptions
) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: { validate: isValidMediaContainerName },
    });
  };
};
