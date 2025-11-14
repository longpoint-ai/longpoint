import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';
import { BaseError } from './base.error';

export class InvalidProviderConfig extends BaseError {
  constructor(
    providerType: string,
    providerId: string,
    messages: string | string[]
  ) {
    super(ErrorCode.INVALID_PROVIDER_CONFIG, messages, HttpStatus.BAD_REQUEST, {
      providerType,
      providerId,
    });
  }
}
