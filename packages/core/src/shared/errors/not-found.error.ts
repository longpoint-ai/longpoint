import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class ResourceNotFound extends BaseError {
  constructor(resource: string, value: string, uniqueField = 'id') {
    super(
      ErrorCode.RESOURCE_NOT_FOUND,
      `${resource} with ${uniqueField} ${value} not found`,
      HttpStatus.NOT_FOUND
    );
  }
}
