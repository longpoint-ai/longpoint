import { ApiSdkTag, RequirePermission } from '@/shared/decorators';
import { ApiMediaContainerNotFoundResponse } from '@/shared/errors';
import { SdkTag } from '@/shared/types/swagger.types';
import { Permission } from '@longpoint/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  CreateMediaContainerDto,
  CreateMediaContainerResponseDto,
  DeleteMediaContainerDto,
  MediaContainerDto,
  UpdateMediaContainerDto,
} from './dtos';
import { ApiMediaContainerAlreadyExistsResponse } from './media.errors';
import { MediaService } from './media.service';

@Controller('media')
@ApiSdkTag(SdkTag.Media)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @RequirePermission(Permission.MEDIA_CONTAINER_CREATE)
  @ApiOperation({
    summary: 'Create a media container',
    operationId: 'createMedia',
    description:
      'Creates an empty container that is ready to receive an upload.',
  })
  @ApiCreatedResponse({
    description: 'Use the returned signed url to upload the original asset.',
    type: CreateMediaContainerResponseDto,
  })
  async createMediaContainer(@Body() body: CreateMediaContainerDto) {
    return this.mediaService.createMediaContainer(body);
  }

  @Get(':containerId')
  @RequirePermission(Permission.MEDIA_CONTAINER_READ)
  @ApiOperation({
    summary: 'Get a media container',
    operationId: 'getMedia',
  })
  @ApiOkResponse({ type: MediaContainerDto })
  @ApiMediaContainerNotFoundResponse()
  async getMediaContainer(@Param('containerId') containerId: string) {
    return this.mediaService.getMediaContainer(containerId);
  }

  @Patch(':containerId')
  @RequirePermission(Permission.MEDIA_CONTAINER_UPDATE)
  @ApiOperation({
    summary: 'Update a media container',
    operationId: 'updateMedia',
  })
  @ApiOkResponse({ type: MediaContainerDto })
  @ApiMediaContainerNotFoundResponse()
  @ApiMediaContainerAlreadyExistsResponse()
  async updateMediaContainer(
    @Param('containerId') containerId: string,
    @Body() body: UpdateMediaContainerDto
  ) {
    return this.mediaService.updateMediaContainer(containerId, body);
  }

  @Delete(':containerId')
  @RequirePermission(Permission.MEDIA_CONTAINER_DELETE)
  @ApiOperation({
    summary: 'Delete a media container',
    operationId: 'deleteMedia',
    description: 'All associated assets will be deleted.',
  })
  @ApiOkResponse({ description: 'The media container was deleted' })
  async deleteMediaContainer(
    @Param('containerId') containerId: string,
    @Body() body: DeleteMediaContainerDto
  ) {
    return this.mediaService.deleteMediaContainer(containerId, body);
  }
}
