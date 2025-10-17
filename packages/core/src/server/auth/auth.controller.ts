import { All, Controller, Logger, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import type { Request, Response } from 'express';
import { Public } from '../common/decorators';
import { ConfigService, PrismaService } from '../common/services';
import { getAuthConfig } from './auth-config';

@Controller('auth')
@Public()
@ApiExcludeController()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ) {}

  @All('{*any}')
  async handleAll(@Req() req: Request, @Res() res: Response) {
    const auth = getAuthConfig(
      this.configService,
      this.prismaService,
      this.logger
    );
    const handler = toNodeHandler(auth);
    return handler(req, res);
  }
}
