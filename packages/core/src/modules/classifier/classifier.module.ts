import { Module } from '@nestjs/common';
import { ClassifierController } from './classifier.controller';
import { ClassifierService } from './classifier.service';

@Module({
  controllers: [ClassifierController],
  providers: [ClassifierService],
})
export class ClassifierModule {}
