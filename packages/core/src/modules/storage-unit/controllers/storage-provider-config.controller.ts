import { ApiSdkTag, RequirePermission } from '@/shared/decorators';
import { SdkTag } from '@/shared/types/swagger.types';
import { Permission } from '@longpoint/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  CreateStorageProviderConfigDto,
  StorageConfigDto,
  StorageProviderConfigSummaryDto,
  UpdateStorageProviderConfigDto,
} from '../dtos/config/storage-config.dto';
import { StorageProviderConfigService } from '../services/storage-provider-config.service';
import {
  ApiStorageProviderConfigInUseResponse,
  ApiStorageProviderConfigNotFoundResponse,
} from '../storage-unit.errors';

@Controller('storage/configs')
@ApiSdkTag(SdkTag.Storage)
@ApiBearerAuth()
export class StorageProviderConfigController {
  constructor(
    private readonly storageProviderConfigService: StorageProviderConfigService
  ) {}

  @Post()
  @RequirePermission(Permission.STORAGE_UNIT_CREATE)
  @ApiOperation({
    summary: 'Create a storage provider config',
    operationId: 'createStorageProviderConfig',
  })
  @ApiCreatedResponse({ type: StorageConfigDto })
  async createStorageProviderConfig(
    @Body() body: CreateStorageProviderConfigDto
  ) {
    const config = await this.storageProviderConfigService.createConfig(body);
    return config.toDto();
  }

  @Get()
  @RequirePermission(Permission.STORAGE_UNIT_READ)
  @ApiOperation({
    summary: 'List storage provider configs',
    operationId: 'listStorageProviderConfigs',
  })
  @ApiOkResponse({ type: [StorageProviderConfigSummaryDto] })
  async listStorageProviderConfigs(@Query('providerId') providerId?: string) {
    const configs = await this.storageProviderConfigService.listConfigs(
      providerId
    );
    return Promise.all(configs.map((config) => config.toSummaryDto()));
  }

  @Get(':id')
  @RequirePermission(Permission.STORAGE_UNIT_READ)
  @ApiOperation({
    summary: 'Get a storage provider config',
    operationId: 'getStorageProviderConfig',
  })
  @ApiOkResponse({ type: StorageConfigDto })
  @ApiStorageProviderConfigNotFoundResponse()
  async getStorageProviderConfig(@Param('id') id: string) {
    const config = await this.storageProviderConfigService.getConfigByIdOrThrow(
      id
    );
    return config.toDto();
  }

  @Patch(':id')
  @RequirePermission(Permission.STORAGE_UNIT_UPDATE)
  @ApiOperation({
    summary: 'Update a storage provider config',
    operationId: 'updateStorageProviderConfig',
  })
  @ApiOkResponse({ type: StorageConfigDto })
  @ApiStorageProviderConfigNotFoundResponse()
  async updateStorageProviderConfig(
    @Param('id') id: string,
    @Body() body: UpdateStorageProviderConfigDto
  ) {
    const config = await this.storageProviderConfigService.updateConfig(
      id,
      body
    );
    return config.toDto();
  }

  @Delete(':id')
  @RequirePermission(Permission.STORAGE_UNIT_DELETE)
  @ApiOperation({
    summary: 'Delete a storage provider config',
    operationId: 'deleteStorageProviderConfig',
  })
  @ApiOkResponse({ description: 'The storage provider config was deleted' })
  @ApiStorageProviderConfigNotFoundResponse()
  @ApiStorageProviderConfigInUseResponse()
  async deleteStorageProviderConfig(@Param('id') id: string) {
    await this.storageProviderConfigService.deleteConfig(id);
  }
}
