import { ErrorCode } from '@longpoint/types';
import { HttpException } from '@nestjs/common';

export interface BaseErrorResponse {
  errorCode: ErrorCode;
  messages: string[];
  details?: Record<string, any>;
}

export class BaseError extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string | string[],
    status: number,
    details?: Record<string, any>
  ) {
    const response: BaseErrorResponse = {
      errorCode,
      messages: Array.isArray(message) ? message : [message],
      ...(details ? { details } : {}),
    };
    super(response, status);
  }

  toJSON() {
    const response = this.getResponse() as BaseErrorResponse;
    return {
      errorCode: this.errorCode,
      messages: response.messages || [this.message],
      ...(response.details ? { details: response.details } : {}),
    };
  }

  getMessages(): string[] {
    const response = this.getResponse() as BaseErrorResponse;
    return Array.isArray(response.messages)
      ? response.messages
      : [response.messages];
  }
}
