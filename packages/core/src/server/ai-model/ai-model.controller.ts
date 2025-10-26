import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiSdkTag } from '../common/decorators';
import { ModelSummaryDto } from '../common/dtos/model';
import { SdkTag } from '../common/types/swagger.types';
import { AiModelService } from './ai-model.service';

@Controller('ai/models')
@ApiSdkTag(SdkTag.AI)
@ApiBearerAuth()
export class AiModelController {
  constructor(private readonly modelService: AiModelService) {}

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
