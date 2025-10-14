import { Global, Module } from '@nestjs/common';
import { ConfigService } from './services/config/config.service';
import { PrismaService } from './services/prisma/prisma.service';
import { StorageService } from './services/storage/storage.service';

const EXPORTS = [ConfigService, PrismaService, StorageService];

@Global()
@Module({
  imports: [],
  providers: [...EXPORTS],
  exports: EXPORTS,
})
export class CommonModule {}
