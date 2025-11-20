import { Module } from '@nestjs/common';
import { AiModelController } from './controllers/ai-model.controller';
import { AiProviderController } from './controllers/ai-provider.controller';
import { AiProviderService } from './services/ai-provider.service';

@Module({
  controllers: [AiModelController, AiProviderController],
  providers: [AiProviderService],
  exports: [AiProviderService],
})
export class AiModule {}
