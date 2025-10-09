import { ErrorCode } from '@longpoint/types';
import { HttpException } from '@nestjs/common';

export class BaseError extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string | string[],
    status: number,
    details?: Record<string, any>
  ) {
    const response = {
      errorCode,
      messages: Array.isArray(message) ? message : [message],
      ...(details ? { details } : {}),
    };
    super(response, status);
  }

  public toJSON() {
    const response = this.getResponse() as any;
    return {
      errorCode: this.errorCode,
      messages: response.messages || [this.message],
      ...(response.details ? { details: response.details } : {}),
    };
  }
}
