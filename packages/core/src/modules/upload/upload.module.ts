import { Module } from '@nestjs/common';
import { ClassifierModule } from '../classifier';
import { MediaModule } from '../media';
import { StorageModule } from '../storage';
import { StorageUnitModule } from '../storage-unit';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [ClassifierModule, MediaModule, StorageModule, StorageUnitModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
