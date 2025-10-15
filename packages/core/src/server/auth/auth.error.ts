import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../common/errors';

export class InvalidAuthorization extends BaseError {
  constructor() {
    super(
      ErrorCode.INVALID_AUTHORIZATION,
      'Invalid authorization',
      HttpStatus.UNAUTHORIZED
    );
  }
}
