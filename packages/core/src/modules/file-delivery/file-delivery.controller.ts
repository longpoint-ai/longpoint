import { Public } from '@/shared/decorators';
import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { TransformParamsDto } from './dtos/transform-params.dto';
import { FileDeliveryService } from './services/file-delivery.service';

@Controller('m')
@Public()
@ApiExcludeController()
export class StorageController {
  constructor(private readonly fileDeliveryService: FileDeliveryService) {}

  @Get('*path')
  async serveFile(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: TransformParamsDto
  ) {
    return this.fileDeliveryService.serveFile(req, res, query);
  }
}
