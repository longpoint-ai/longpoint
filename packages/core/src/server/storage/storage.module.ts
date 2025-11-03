import { Module } from '@nestjs/common';
import { ImageTransformService } from './services/image-transform.service';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [],
  controllers: [StorageController],
  providers: [StorageService, ImageTransformService],
})
export class StorageModule {}
