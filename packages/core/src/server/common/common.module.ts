import { Global, Module } from '@nestjs/common';
import { StorageUnitService } from './services';
import { AiPluginService } from './services/ai-plugin/ai-plugin.service';
import { CommonClassifierService } from './services/common-classifier/common-classifier.service';
import { ConfigService } from './services/config/config.service';
import { EncryptionService } from './services/encryption/encryption.service';
import { MediaContainerService } from './services/media-container/media-container.service';
import { PrismaService } from './services/prisma/prisma.service';

const EXPORTS = [
  AiPluginService,
  CommonClassifierService,
  MediaContainerService,
  ConfigService,
  EncryptionService,
  PrismaService,
  StorageUnitService,
];

@Global()
@Module({
  imports: [],
  providers: [...EXPORTS],
  exports: EXPORTS,
})
export class CommonModule {}
