import { ApiSdkTag, Public } from '@/shared/decorators';
import { SdkTag } from '@/shared/types/swagger.types';
import { Controller, Param, Put, Query, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { type Request } from 'express';
import { ApiMediaContainerNotFoundResponse } from '../media/media.errors';
import { UploadAssetQueryDto } from './dtos/upload-asset.dto';
import { UploadService } from './upload.service';

@Controller('media/containers')
@ApiSdkTag(SdkTag.Media)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Put(':containerId/upload')
  @Public()
  @ApiOperation({
    summary: 'Upload an asset to a media container',
    operationId: 'upload',
  })
  @ApiOkResponse({ description: 'The asset was uploaded' })
  @ApiMediaContainerNotFoundResponse()
  async upload(
    @Param('containerId') containerId: string,
    @Query() query: UploadAssetQueryDto,
    @Req() req: Request
  ) {
    return this.uploadService.upload(containerId, query, req);
  }
}
