import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class ResourceAlreadyExists extends BaseError {
  constructor(message: string) {
    super(ErrorCode.RESOURCE_ALREADY_EXISTS, message, HttpStatus.CONFLICT);
  }
}
