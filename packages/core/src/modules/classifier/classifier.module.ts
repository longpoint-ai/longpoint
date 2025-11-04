import { Module } from '@nestjs/common';
import { AiModule } from '../ai';
import { MediaModule } from '../media';
import { ClassifierController } from './classifier.controller';
import { ClassifierService } from './classifier.service';

@Module({
  imports: [AiModule, MediaModule],
  controllers: [ClassifierController],
  providers: [ClassifierService],
  exports: [ClassifierService],
})
export class ClassifierModule {}
