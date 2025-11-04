import { Module } from '@nestjs/common';
import { StorageUnitModule } from '../storage-unit';
import { FileDeliveryService } from './services/file-delivery.service';
import { ImageTransformService } from './services/image-transform.service';
import { StorageController } from './storage.controller';

@Module({
  imports: [StorageUnitModule],
  controllers: [StorageController],
  providers: [FileDeliveryService, ImageTransformService],
})
export class StorageModule {}
