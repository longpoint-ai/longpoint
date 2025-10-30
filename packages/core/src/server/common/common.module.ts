import { Global, Module } from '@nestjs/common';
import { AiPluginService } from './services/ai-plugin/ai-plugin.service';
import { CommonClassifierService } from './services/common-classifier/common-classifier.service';
import { CommonMediaService } from './services/common-media/common-media.service';
import { ConfigService } from './services/config/config.service';
import { EncryptionService } from './services/encryption/encryption.service';
import { PrismaService } from './services/prisma/prisma.service';
import { StorageService } from './services/storage/storage.service';

const EXPORTS = [
  AiPluginService,
  CommonClassifierService,
  CommonMediaService,
  EncryptionService,
  ConfigService,
  PrismaService,
  StorageService,
];

@Global()
@Module({
  imports: [],
  providers: [...EXPORTS],
  exports: EXPORTS,
})
export class CommonModule {}
