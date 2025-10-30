import { Permission } from '@longpoint/types';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiSdkTag, RequirePermission } from '../common/decorators';
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
  @RequirePermission(Permission.AI_PROVIDER_READ)
  @ApiOperation({
    summary: 'Get an AI provider',
    operationId: 'getAiProvider',
  })
  @ApiOkResponse({ type: AiProviderDto })
  @ApiAiProviderNotFoundResponse()
  async getAiProvider(@Param('providerId') providerId: string) {
    return this.aiProviderService.getAiProvider(providerId);
  }

  @Get()
  @RequirePermission(Permission.AI_PROVIDER_READ)
  @ApiOperation({
    summary: 'List installed AI providers',
    operationId: 'listAiProviders',
  })
  @ApiOkResponse({ type: [AiProviderDto] })
  async listAiProviders() {
    return this.aiProviderService.listAiProviders();
  }

  @Patch(':providerId')
  @RequirePermission(Permission.AI_PROVIDER_UPDATE)
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
