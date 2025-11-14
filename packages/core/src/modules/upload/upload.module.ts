import { Module } from '@nestjs/common';
import { ClassifierModule } from '../classifier';
import { EventModule } from '../event';
import { MediaModule } from '../media';
import { StorageModule } from '../storage';
import { StorageUnitModule } from '../storage-unit';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    ClassifierModule,
    MediaModule,
    StorageModule,
    StorageUnitModule,
    EventModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
