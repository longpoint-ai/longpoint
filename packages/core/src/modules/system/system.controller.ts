import { ApiSdkTag, Public } from '@/shared/decorators';
import { SdkTag } from '@/shared/types/swagger.types';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SetupStatusDto } from './dtos/setup-status.dto';
import { SystemStatusDto } from './dtos/system-status.dto';
import { SystemService } from './system.service';

@Controller('system')
@ApiSdkTag(SdkTag.System)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('setup/status')
  @Public()
  @ApiOperation({
    summary: 'Get system setup status',
    operationId: 'getSetupStatus',
  })
  @ApiOkResponse({ type: SetupStatusDto })
  async getSetupStatus() {
    return this.systemService.getSetupStatus();
  }

  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get system status',
    operationId: 'getSystemStatus',
  })
  @ApiOkResponse({ type: SystemStatusDto })
  async getSystemStatus() {
    return this.systemService.getSystemStatus();
  }
}
