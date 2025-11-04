import { BaseError } from '@/shared/errors';
import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';

export class TokenExpired extends BaseError {
  constructor() {
    super(ErrorCode.EXPIRED, 'Token expired', HttpStatus.UNAUTHORIZED);
  }
}
