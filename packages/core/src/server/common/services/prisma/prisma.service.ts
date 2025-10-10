import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@/database';
import { ConfigService } from '../config/config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {
    super({
      datasourceUrl: configService.get('databaseUrl'),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
