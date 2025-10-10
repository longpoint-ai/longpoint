import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma/prisma.service';
import { ConfigService } from './services/config/config.service';

const EXPORTED_PROVIDERS = [PrismaService, ConfigService];

@Global()
@Module({
  imports: [],
  providers: [...EXPORTED_PROVIDERS],
  exports: EXPORTED_PROVIDERS,
})
export class CommonModule {}
