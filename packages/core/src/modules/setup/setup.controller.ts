import { ApiSdkTag, Public } from '@/shared/decorators';
import { SdkTag } from '@/shared/types/swagger.types';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SetupStatusDto } from './dtos/setup-status.dto';
import { SetupService } from './setup.service';

@Controller('setup')
@Public()
@ApiSdkTag(SdkTag.Tools)
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Get first time setup status',
    operationId: 'getSetupStatus',
  })
  @ApiOkResponse({ type: SetupStatusDto })
  async getStatus() {
    return this.setupService.getStatus();
  }
}
