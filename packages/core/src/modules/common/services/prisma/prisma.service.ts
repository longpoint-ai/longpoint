import { Prisma, PrismaClient } from '@/database';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    super({
      datasourceUrl: configService.get('database.url'),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  static isNotFoundError(
    error: unknown
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    );
  }
}
