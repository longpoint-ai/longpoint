import { Module } from '@nestjs/common';
import { ClassifierModule } from '../classifier';
import { MediaModule } from '../media';
import { StorageUnitModule } from '../storage-unit';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [ClassifierModule, MediaModule, StorageUnitModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
