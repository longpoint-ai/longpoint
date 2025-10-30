import { Module } from '@nestjs/common';
import { AiModelController } from './ai-model.controller';
import { AiModelService } from './ai-model.service';

@Module({
  controllers: [AiModelController],
  providers: [AiModelService],
})
export class AiModelModule {}
