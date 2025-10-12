import { toNodeHandler } from 'better-auth/node';
import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { getAuthConfig } from './auth-config';
import { ConfigService, PrismaService } from '../common/services';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('auth')
@ApiExcludeController()
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ) {}

  @All('{*any}')
  async handleAll(@Req() req: Request, @Res() res: Response) {
    const auth = getAuthConfig(this.configService, this.prismaService);
    const handler = toNodeHandler(auth);
    return handler(req, res);
  }
}
