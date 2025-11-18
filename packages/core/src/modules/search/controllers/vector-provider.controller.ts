import { ApiSdkTag } from '@/shared/decorators';
import { SdkTag } from '@/shared/types/swagger.types';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UpdateVectorProviderConfigDto, VectorProviderDto } from '../dtos';
import { VectorProviderService } from '../services/vector-provider.service';

@Controller('search/vector-providers')
@ApiSdkTag(SdkTag.Search)
@ApiBearerAuth()
export class VectorProviderController {
  constructor(private readonly vectorProviderService: VectorProviderService) {}

  @Get()
  @ApiOperation({
    summary: 'List installed vector providers',
    operationId: 'listVectorProviders',
  })
  @ApiOkResponse({ type: [VectorProviderDto] })
  async listVectorProviders() {
    const providers = await this.vectorProviderService.listProviders();
    return providers.map((provider) => provider.toDto());
  }

  @Patch(':providerId')
  @ApiOperation({
    summary: 'Update the config for a vector provider',
    operationId: 'updateVectorProviderConfig',
  })
  @ApiOkResponse({ type: VectorProviderDto })
  async updateVectorProviderConfig(
    @Param('providerId') providerId: string,
    @Body() body: UpdateVectorProviderConfigDto
  ) {
    const provider = await this.vectorProviderService.updateProviderConfig(
      providerId,
      body.config
    );
    return provider.toDto();
  }
}
