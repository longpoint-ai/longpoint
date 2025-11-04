import { ApiSdkTag } from '@/shared/decorators';
import { SdkTag } from '@/shared/types/swagger.types';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AiModelDto } from '../dtos';
import { AiPluginService } from '../services/ai-plugin.service';

@Controller('ai/models')
@ApiSdkTag(SdkTag.AI)
@ApiBearerAuth()
export class AiModelController {
  constructor(private readonly aiPluginService: AiPluginService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get a model',
    operationId: 'getModel',
  })
  @ApiOkResponse({ type: AiModelDto })
  async getModel(@Param('id') id: string) {
    const model = await this.aiPluginService.getModelOrThrow(id);
    return model.toDto();
  }

  @Get()
  @ApiOperation({
    summary: 'List installed models',
    operationId: 'listModels',
  })
  @ApiOkResponse({ type: [AiModelDto] })
  async listModels() {
    return this.aiPluginService.listModels().map((model) => model.toDto());
  }
}
