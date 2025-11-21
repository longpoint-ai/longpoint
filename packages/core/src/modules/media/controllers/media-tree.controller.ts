import { ApiSdkTag, RequirePermission } from '@/shared/decorators';
import { SdkTag } from '@/shared/types/swagger.types';
import { Permission } from '@longpoint/types';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetLibraryTreeQueryDto, LibraryTreeDto } from '../dtos';
import { MediaTreeService } from '../services/media-tree.service';

@Controller('media')
@ApiSdkTag(SdkTag.Media)
@ApiBearerAuth()
export class MediaTreeController {
  constructor(private readonly mediaTreeService: MediaTreeService) {}

  @Get('tree')
  @RequirePermission(Permission.MEDIA_CONTAINER_READ)
  @ApiOperation({
    summary: 'List the contents of a media tree',
    operationId: 'getTree',
  })
  @ApiOkResponse({
    description: 'The contents of the media tree',
    type: LibraryTreeDto,
  })
  async getTree(@Query() query: GetLibraryTreeQueryDto) {
    return this.mediaTreeService.getTree(query);
  }
}
