import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiSdkTag } from '../common/decorators';
import { SdkTag } from '../common/types/swagger.types';
import { ModelSummaryDto } from './dtos/model-summary.dto';
import { ModelService } from './model.service';

@Controller('ai/models')
@ApiSdkTag(SdkTag.AI)
@ApiBearerAuth()
export class ModelsController {
  constructor(private readonly modelService: ModelService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get a model',
    operationId: 'getModel',
  })
  async getModel(@Param('id') id: string) {
    return this.modelService.getModel(id);
  }

  @Get()
  @ApiOperation({
    summary: 'List installed models',
    operationId: 'listModels',
  })
  @ApiOkResponse({ type: [ModelSummaryDto] })
  async listModels() {
    return this.modelService.listModels();
  }
}
