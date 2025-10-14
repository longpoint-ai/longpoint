import { Module } from '@nestjs/common';
import { UploadController } from './features/upload/upload.controller';
import { UploadService } from './features/upload/upload.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { ProbeService } from './services/probe.service';

@Module({
  controllers: [MediaController, UploadController],
  providers: [MediaService, ProbeService, UploadService],
})
export class MediaModule {}
