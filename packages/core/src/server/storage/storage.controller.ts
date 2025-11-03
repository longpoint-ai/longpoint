import { Public } from '@/server/common/decorators';
import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { TransformParamsDto } from './dtos/transform-params.dto';
import { StorageService } from './storage.service';

@Controller('storage')
@Public()
@ApiExcludeController()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('*path')
  async serveFile(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: TransformParamsDto
  ) {
    return this.storageService.serveFile(req, res, query);
  }
}
