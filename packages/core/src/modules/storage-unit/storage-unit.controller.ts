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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  CreateStorageUnitDto,
  StorageUnitDto,
  StorageUnitSummaryDto,
  UpdateStorageUnitDto,
} from './dtos';
import {
  ApiCannotDeleteDefaultStorageUnitResponse,
  ApiStorageUnitInUseResponse,
  ApiStorageUnitNotFoundResponse,
} from './storage-unit.errors';
import { StorageUnitService } from './storage-unit.service';

@Controller('storage-units')
@ApiSdkTag(SdkTag.Media)
@ApiBearerAuth()
export class StorageUnitController {
  constructor(private readonly storageUnitService: StorageUnitService) {}

  @Post()
  @RequirePermission(Permission.STORAGE_UNIT_CREATE)
  @ApiOperation({
    summary: 'Create a storage unit',
    operationId: 'createStorageUnit',
  })
  @ApiCreatedResponse({ type: StorageUnitDto })
  async createStorageUnit(@Body() body: CreateStorageUnitDto) {
    const storageUnit = await this.storageUnitService.createStorageUnit(body);
    return storageUnit.toDto();
  }

  @Get()
  @RequirePermission(Permission.STORAGE_UNIT_READ)
  @ApiOperation({
    summary: 'List storage units',
    operationId: 'listStorageUnits',
  })
  @ApiOkResponse({ type: [StorageUnitSummaryDto] })
  async listStorageUnits() {
    const storageUnits = await this.storageUnitService.listStorageUnits();
    return Promise.all(storageUnits.map((unit) => unit.toSummaryDto()));
  }

  @Get(':storageUnitId')
  @RequirePermission(Permission.STORAGE_UNIT_READ)
  @ApiOperation({
    summary: 'Get a storage unit',
    operationId: 'getStorageUnit',
  })
  @ApiOkResponse({ type: StorageUnitDto })
  @ApiStorageUnitNotFoundResponse()
  async getStorageUnit(@Param('id') id: string) {
    const storageUnit = await this.storageUnitService.getStorageUnitByIdOrThrow(
      id
    );
    return storageUnit.toDto();
  }

  @Patch(':storageUnitId')
  @RequirePermission(Permission.STORAGE_UNIT_UPDATE)
  @ApiOperation({
    summary: 'Update a storage unit',
    operationId: 'updateStorageUnit',
  })
  @ApiOkResponse({ type: StorageUnitDto })
  @ApiStorageUnitNotFoundResponse()
  async updateStorageUnit(
    @Param('id') id: string,
    @Body() body: UpdateStorageUnitDto
  ) {
    const storageUnit = await this.storageUnitService.getStorageUnitByIdOrThrow(
      id
    );
    await storageUnit.update(body);
    return storageUnit.toDto();
  }

  @Delete(':storageUnitId')
  @RequirePermission(Permission.STORAGE_UNIT_DELETE)
  @ApiOperation({
    summary: 'Delete a storage unit',
    operationId: 'deleteStorageUnit',
  })
  @ApiOkResponse({ description: 'The storage unit was deleted' })
  @ApiStorageUnitNotFoundResponse()
  @ApiStorageUnitInUseResponse()
  @ApiCannotDeleteDefaultStorageUnitResponse()
  async deleteStorageUnit(@Param('storageUnitId') id: string) {
    const storageUnit = await this.storageUnitService.getStorageUnitByIdOrThrow(
      id
    );
    await storageUnit.delete();
  }

  // @Get('provider-config-schemas')
  // @RequirePermission(Permission.STORAGE_UNIT_READ)
  // @ApiOperation({
  //   summary: 'Get provider configuration schemas',
  //   operationId: 'getProviderConfigSchemas',
  //   description: 'Returns the configuration schemas for all storage providers',
  // })
  // @ApiOkResponse({
  //   description: 'Provider configuration schemas',
  //   schema: {
  //     type: 'object',
  //     additionalProperties: true,
  //   },
  // })
  // async getProviderConfigSchemas() {
  //   return STORAGE_PROVIDER_UI_CONFIG_SCHEMAS;
  // }
}
