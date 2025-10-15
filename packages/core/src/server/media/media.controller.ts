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
import { RequirePermission } from '../common/decorators';
import { ApiSdkTag } from '../common/decorators/api-sdk-tag.decorator';
import { MediaContainerDto } from '../common/dtos/media';
import { ApiMediaContainerNotFoundResponse } from '../common/errors';
import { SdkTag } from '../common/types/swagger.types';
import { CreateMediaContainerDto } from './dtos/create-media-container.dto';
import { DeleteMediaContainerDto } from './dtos/delete-media-container.dto';
import { UpdateMediaContainerDto } from './dtos/update-media-container.dto';
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
  @RequirePermission(Permission.MEDIA_CONTAINER_READ)
  @ApiOperation({
    summary: 'Get a media container',
    operationId: 'getMediaContainer',
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
    operationId: 'updateMediaContainer',
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
    operationId: 'deleteMediaContainer',
    description: 'Deletes a media container and all associated assets.',
  })
  @ApiOkResponse({ description: 'The media container was deleted' })
  async deleteMediaContainer(
    @Param('containerId') containerId: string,
    @Body() body: DeleteMediaContainerDto
  ) {
    return this.mediaService.deleteMediaContainer(containerId, body);
  }
}
