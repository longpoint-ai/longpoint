import { Module } from '@nestjs/common';
import { AiProviderController } from './ai-provider.controller';
import { AiProviderService } from './ai-provider.service';

@Module({
  controllers: [AiProviderController],
  providers: [AiProviderService],
})
export class AiProviderModule {}
