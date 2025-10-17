import { Permission } from '@longpoint/types';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiSdkTag, RequirePermission } from '../common/decorators';
import { SdkTag } from '../common/types/swagger.types';
import { GetLibraryTreeQueryDto, LibraryTreeDto } from './dtos';
import { LibraryService } from './library.service';

@Controller('library')
@ApiSdkTag(SdkTag.Library)
@ApiBearerAuth()
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('tree')
  @RequirePermission(Permission.MEDIA_CONTAINER_READ)
  @ApiOperation({
    summary: 'List the contents of a library tree',
    operationId: 'getTree',
  })
  @ApiOkResponse({
    description: 'The contents of the library tree',
    type: LibraryTreeDto,
  })
  async getTree(@Query() query: GetLibraryTreeQueryDto) {
    return this.libraryService.getTree(query);
  }
}
