import { Module } from '@nestjs/common';
import { ModelsController } from './model.controller';
import { ModelService } from './model.service';

@Module({
  controllers: [ModelsController],
  providers: [ModelService],
})
export class ModelModule {}
