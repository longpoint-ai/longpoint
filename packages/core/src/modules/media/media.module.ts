import { Module } from '@nestjs/common';
import { MediaProbeService } from '../common/services/media-probe/media-probe.service';
import { EventModule } from '../event';
import { FileDeliveryModule } from '../file-delivery';
import { StorageModule } from '../storage';
import { MediaContainerController } from './controllers/media-container.controller';
import { MediaTreeController } from './controllers/media-tree.controller';
import { MediaContainerService } from './services/media-container.service';
import { MediaTreeService } from './services/media-tree.service';

@Module({
  imports: [StorageModule, FileDeliveryModule, EventModule],
  controllers: [MediaContainerController, MediaTreeController],
  providers: [MediaContainerService, MediaProbeService, MediaTreeService],
  exports: [MediaContainerService],
})
export class MediaModule {}
