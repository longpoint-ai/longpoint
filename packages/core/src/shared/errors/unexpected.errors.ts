import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class Unexpected extends BaseError {
  constructor(message = 'An unexpected error occurred') {
    super(ErrorCode.UNKNOWN, message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
