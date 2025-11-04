import { ErrorCode } from '@longpoint/types';
import {
  type ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseError } from '../../../shared/errors/base.error.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger();

  catch(exception: Error, host: ArgumentsHost) {
    if (exception instanceof BaseError) {
      const error = exception.toJSON().messages.join(', ');
      this.logger.error(error);
    } else {
      this.logger.error(exception);
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
