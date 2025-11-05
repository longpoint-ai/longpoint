import { Module } from '@nestjs/common';
import { MediaProbeService } from '../common/services/media-probe/media-probe.service';
import { StorageUnitModule } from '../storage-unit';
import { MediaController } from './media.controller';
import { MediaContainerService } from './services/media-container.service';

@Module({
  imports: [StorageUnitModule],
  controllers: [MediaController],
  providers: [MediaContainerService, MediaProbeService],
  exports: [MediaContainerService],
})
export class MediaModule {}
