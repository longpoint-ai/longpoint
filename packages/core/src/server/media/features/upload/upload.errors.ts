import { BaseError } from '@/server/common/errors';
import { ErrorCode } from '@longpoint/types';
import { HttpStatus } from '@nestjs/common';

export class TokenExpired extends BaseError {
  constructor() {
    super(ErrorCode.EXPIRED, 'Token expired', HttpStatus.UNAUTHORIZED);
  }
}
