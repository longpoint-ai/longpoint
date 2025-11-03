import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../common/errors';

export class FileNotFound extends BaseError {
  constructor(path: string) {
    super(
      ErrorCode.RESOURCE_NOT_FOUND,
      `File not found: ${path}`,
      HttpStatus.NOT_FOUND
    );
  }
}
