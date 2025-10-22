import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiSdkTag } from '../common/decorators';
import { SdkTag } from '../common/types/swagger.types';
import { ModelService } from './model.service';

@Controller('ai/models')
@ApiSdkTag(SdkTag.AI)
@ApiBearerAuth()
export class ModelsController {
  constructor(private readonly modelService: ModelService) {}

  @Get()
  @ApiOperation({
    summary: 'List installed models',
    operationId: 'listModels',
  })
  async listModels() {
    return this.modelService.listModels();
  }
}
