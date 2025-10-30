import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class ModelOperationNotSupported extends BaseError {
  constructor(operation: string, modelId: string) {
    super(
      ErrorCode.OPERATION_NOT_SUPPORTED,
      `Operation '${operation}' is not supported for model '${modelId}'`,
      HttpStatus.BAD_REQUEST,
      { operation, modelId }
    );
  }
}
