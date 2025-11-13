import { Module } from '@nestjs/common';
import { AiModule } from '../ai';
import { EventModule } from '../event';
import { MediaModule } from '../media';
import { ClassifierController } from './classifier.controller';
import { ClassifierListeners } from './classifier.listeners';
import { ClassifierService } from './classifier.service';

@Module({
  imports: [AiModule, MediaModule, EventModule],
  controllers: [ClassifierController],
  providers: [ClassifierService, ClassifierListeners],
  exports: [ClassifierService],
})
export class ClassifierModule {}
