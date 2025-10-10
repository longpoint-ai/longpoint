import { BaseError } from '../errors/base.error.js';
import { ErrorCode } from '@longpoint/types';
import {
  type ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    if (exception instanceof BaseError) {
      console.error(JSON.stringify(exception.toJSON(), null, 2));
    } else {
      console.error(exception);
    }

    let errorResponse: ReturnType<BaseError['toJSON']> = {
      errorCode: ErrorCode.UNKNOWN,
      messages: ['Something went wrong, please try again later.'],
    };
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (
      exception instanceof HttpException &&
      exception.getStatus() !== HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      status = exception.getStatus();
      if (exception instanceof BaseError) {
        errorResponse = exception.toJSON();
      } else {
        if (exception instanceof ForbiddenException) {
          errorResponse.errorCode = ErrorCode.FORBIDDEN;
        }
        errorResponse.messages = [exception.message];
      }
    }

    const response = host.switchToHttp().getResponse();

    response.status(status).json(errorResponse);
  }
}
