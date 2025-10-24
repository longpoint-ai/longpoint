import { length, registerDecorator, ValidationOptions } from 'class-validator';

export const mediaContainerNameConstants = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 255,
};

export const isValidMediaContainerName = (name: string) => {
  return length(
    name,
    mediaContainerNameConstants.MIN_NAME_LENGTH,
    mediaContainerNameConstants.MAX_NAME_LENGTH
  );
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
