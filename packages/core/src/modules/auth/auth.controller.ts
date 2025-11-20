import { Public } from '@/shared/decorators';
import { All, Controller, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
@Public()
@ApiExcludeController()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @All('{*any}')
  async handleAll(@Req() req: Request, @Res() res: Response) {
    return this.authService.handleAuthRequest(req, res);
  }
}
