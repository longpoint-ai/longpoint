import { ApiSdkTag, RequirePermission } from '@/shared/decorators';
import { SdkTag } from '@/shared/types/swagger.types';
import { Permission } from '@longpoint/types';
import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateSearchIndexDto, SearchIndexDto } from '../dtos';
import { SearchIndexService } from '../services/search-index.service';

@Controller('search/indexes')
@ApiSdkTag(SdkTag.Search)
@ApiBearerAuth()
export class SearchIndexController {
  constructor(private readonly searchIndexService: SearchIndexService) {}

  @Post()
  @RequirePermission(Permission.SEARCH_INDEX_CREATE)
  @ApiOperation({
    summary: 'Create a search index',
    operationId: 'createSearchIndex',
  })
  @ApiCreatedResponse({ type: SearchIndexDto })
  async createSearchIndex(@Body() body: CreateSearchIndexDto) {
    const index = await this.searchIndexService.createIndex(body);
    return index.toDto();
  }

  @Get()
  @RequirePermission(Permission.SEARCH_INDEX_READ)
  @ApiOperation({
    summary: 'List search indexes',
    operationId: 'listSearchIndexes',
  })
  @ApiOkResponse({ type: [SearchIndexDto] })
  async listSearchIndexes() {
    const indexes = await this.searchIndexService.listIndexes();
    return indexes.map((index) => index.toDto());
  }
}
