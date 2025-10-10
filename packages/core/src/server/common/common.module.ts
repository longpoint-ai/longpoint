import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma/prisma.service';
import { ConfigService } from './services/config/config.service';

@Global()
@Module({
  imports: [],
  providers: [PrismaService, ConfigService],
  exports: [PrismaService, ConfigService],
})
export class CommonModule {}
