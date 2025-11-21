import { Module } from '@nestjs/common';
import { MediaProbeService } from '../common/services/media-probe/media-probe.service';
import { EventModule } from '../event';
import { FileDeliveryModule } from '../file-delivery';
import { StorageModule } from '../storage';
import { MediaController } from './media.controller';
import { MediaContainerService } from './services/media-container.service';

@Module({
  imports: [StorageModule, FileDeliveryModule, EventModule],
  controllers: [MediaController],
  providers: [MediaContainerService, MediaProbeService],
  exports: [MediaContainerService],
})
export class MediaModule {}
