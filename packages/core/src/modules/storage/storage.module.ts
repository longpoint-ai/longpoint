import { Module } from '@nestjs/common';
import { StorageUnitModule } from '../storage-unit';
import { FileDeliveryService } from './services/file-delivery.service';
import { ImageTransformService } from './services/image-transform.service';
import { UrlSigningService } from './services/url-signing.service';
import { StorageController } from './storage.controller';

@Module({
  imports: [StorageUnitModule],
  controllers: [StorageController],
  providers: [FileDeliveryService, ImageTransformService, UrlSigningService],
  exports: [UrlSigningService],
})
export class StorageModule {}
