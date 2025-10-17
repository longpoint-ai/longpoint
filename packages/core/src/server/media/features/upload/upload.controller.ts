import { Public } from '@/server/common/decorators';
import { ApiSdkTag } from '@/server/common/decorators/api-sdk-tag.decorator';
import { ApiMediaContainerNotFoundResponse } from '@/server/common/errors';
import { SdkTag } from '@/server/common/types/swagger.types';
import { Controller, Param, Put, Query, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { type Request } from 'express';
import { UploadAssetQueryDto } from './dtos/upload-asset.dto';
import { UploadService } from './upload.service';

@Controller('media')
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
