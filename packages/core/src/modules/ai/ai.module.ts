import { Module } from '@nestjs/common';
import { AiModelController } from './controllers/ai-model.controller';
import { AiProviderController } from './controllers/ai-provider.controller';
import { AiPluginService } from './services/ai-plugin.service';

@Module({
  controllers: [AiModelController, AiProviderController],
  providers: [AiPluginService],
})
export class AiModule {}
