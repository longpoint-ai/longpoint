import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiSdkTag } from '../common/decorators';
import { AiProviderDto } from '../common/dtos/ai-provider';
import { ApiAiProviderNotFoundResponse } from '../common/errors';
import { SdkTag } from '../common/types/swagger.types';
import { AiProviderService } from './ai-provider.service';
import { UpdateAiProviderConfigDto } from './dtos/update-ai-provider-config.dto';

@Controller('ai/providers')
@ApiSdkTag(SdkTag.AI)
@ApiBearerAuth()
export class AiProviderController {
  constructor(private readonly aiProviderService: AiProviderService) {}

  @Get(':providerId')
  @ApiOperation({
    summary: 'Get an AI provider',
    operationId: 'getAiProvider',
  })
  @ApiOkResponse({ type: AiProviderDto })
  @ApiAiProviderNotFoundResponse()
  async getAiProvider(@Param('providerId') providerId: string) {
    return this.aiProviderService.getAiProvider(providerId);
  }

  @Patch(':providerId')
  @ApiOperation({
    summary: 'Update the config for an AI provider',
    operationId: 'updateAiProviderConfig',
  })
  @ApiOkResponse({ type: AiProviderDto })
  async updateAiProviderConfig(
    @Param('providerId') providerId: string,
    @Body() body: UpdateAiProviderConfigDto
  ) {
    return this.aiProviderService.updateAiProviderConfig(
      providerId,
      body.config
    );
  }
}
