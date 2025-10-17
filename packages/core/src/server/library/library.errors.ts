import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from '../common/errors';

export class PathNotFound extends BaseError {
  constructor(path: string) {
    super(
      ErrorCode.RESOURCE_NOT_FOUND,
      `Path not found: ${path}`,
      HttpStatus.NOT_FOUND
    );
  }
}
