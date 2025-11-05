import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const getHttpRequest = <Params = any>(context: ExecutionContext) => {
  return context.switchToHttp().getRequest<Request<Params>>();
};
