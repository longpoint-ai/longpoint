import { toNodeHandler } from 'better-auth/node';
import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { getAuthConfig } from './auth-config';
import { ConfigService } from '../common/services';

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  @All('{*any}')
  async handleAll(@Req() req: Request, @Res() res: Response) {
    const auth = getAuthConfig(this.configService);
    const handler = toNodeHandler(auth);
    return handler(req, res);
  }
}
