import { ApiSdkTag, Public } from '@/shared/decorators';
import { SdkTag } from '@/shared/types/swagger.types';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SetupStatusDto } from './dtos/setup-status.dto';
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
}
