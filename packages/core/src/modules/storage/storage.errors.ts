import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../../shared/errors';

export class FileNotFound extends BaseError {
  constructor(path: string) {
    super(
      ErrorCode.RESOURCE_NOT_FOUND,
      `File not found: ${path}`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class InvalidFilePath extends BaseError {
  constructor(path: string) {
    super(
      ErrorCode.INVALID_INPUT,
      `Invalid file path: ${path}`,
      HttpStatus.BAD_REQUEST
    );
  }
}
