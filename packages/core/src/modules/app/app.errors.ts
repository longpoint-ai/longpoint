import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../../shared/errors';

export class InvalidAuthorization extends BaseError {
  constructor(message: string = 'Invalid authorization') {
    super(ErrorCode.INVALID_AUTHORIZATION, message, HttpStatus.UNAUTHORIZED);
  }
}
