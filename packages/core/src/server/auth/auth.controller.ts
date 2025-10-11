import { toNodeHandler } from 'better-auth/node';
import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { auth } from './auth-config';

@Controller('auth')
export class AuthController {
  constructor() {}

  @All('{*any}')
  async handleAll(@Req() req: Request, @Res() res: Response) {
    const handler = toNodeHandler(auth);
    return handler(req, res);
  }
}
