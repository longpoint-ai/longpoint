import { ApiSdkTag, RequirePermission } from '@/shared/decorators';
import { SdkTag } from '@/shared/types/swagger.types';
import { Permission } from '@longpoint/types';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiAiProviderNotFoundResponse } from '../ai.errors';
import { AiProviderDto } from '../dtos/ai-provider.dto';
import { UpdateAiProviderConfigDto } from '../dtos/update-ai-provider-config.dto';
import { AiPluginService } from '../services/ai-plugin.service';

@Controller('ai/providers')
@ApiSdkTag(SdkTag.AI)
@ApiBearerAuth()
export class AiProviderController {
  constructor(private readonly aiPluginService: AiPluginService) {}

  @Get(':providerId')
  @RequirePermission(Permission.AI_PROVIDER_READ)
  @ApiOperation({
    summary: 'Get an AI provider',
    operationId: 'getAiProvider',
  })
  @ApiOkResponse({ type: AiProviderDto })
  @ApiAiProviderNotFoundResponse()
  async getAiProvider(@Param('providerId') providerId: string) {
    const provider = await this.aiPluginService.getProviderOrThrow(providerId);
    return provider.toDto();
  }

  @Get()
  @RequirePermission(Permission.AI_PROVIDER_READ)
  @ApiOperation({
    summary: 'List installed AI providers',
    operationId: 'listAiProviders',
  })
  @ApiOkResponse({ type: [AiProviderDto] })
  async listAiProviders() {
    return this.aiPluginService
      .listProviders()
      .map((provider) => provider.toDto());
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
    const provider = await this.aiPluginService.updateProviderConfig(
      providerId,
      body.config
    );
    return provider.toDto();
  }
}
