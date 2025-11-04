import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error.js';

export class InvalidInput extends BaseError {
  constructor(message: string | string[]) {
    super(ErrorCode.INVALID_INPUT, message, HttpStatus.BAD_REQUEST);
  }
}
