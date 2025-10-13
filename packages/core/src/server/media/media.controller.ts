import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiSdkTag } from '../common/decorators/api-sdk-tag.decorator';
import { MediaContainerDto } from '../common/dtos/media';
import { ApiMediaContainerNotFoundResponse } from '../common/errors';
import { SdkTag } from '../common/types/swagger.types';
import { CreateMediaContainerDto } from './dtos/create-media-container.dto';
import { MediaService } from './media.service';

@Controller('media')
@ApiSdkTag(SdkTag.Media)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a media container',
    operationId: 'createMediaContainer',
    description:
      'Creates an empty media container that is ready to receive an upload.',
  })
  @ApiCreatedResponse({
    description: 'Use the returned signed url to upload the original asset.',
  })
  async createMediaContainer(@Body() body: CreateMediaContainerDto) {
    return this.mediaService.createMediaContainer(body);
  }

  @Get(':containerId')
  @ApiOperation({
    summary: 'Get a media container',
    operationId: 'getMediaContainer',
  })
  @ApiOkResponse({ type: MediaContainerDto })
  @ApiMediaContainerNotFoundResponse()
  async getMediaContainer(@Param('containerId') containerId: string) {
    return this.mediaService.getMedia(containerId);
  }

  @Delete(':containerId')
  @ApiOperation({
    summary: 'Delete a media container',
    operationId: 'deleteMediaContainer',
    description: 'Deletes a media container and all associated assets.',
  })
  @ApiOkResponse({ description: 'The media container was deleted' })
  async deleteMediaContainer(@Param('containerId') containerId: string) {}

  @Put(':containerId/upload')
  @ApiOperation({
    summary: 'Upload an asset to a media container',
    operationId: 'upload',
  })
  @ApiOkResponse({ description: 'The asset was uploaded' })
  @ApiMediaContainerNotFoundResponse()
  async upload(@Param('containerId') containerId: string) {}
}
