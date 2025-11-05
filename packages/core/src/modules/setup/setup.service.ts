import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services';
import { SetupStatusDto } from './dtos/setup-status.dto';

@Injectable()
export class SetupService {
  constructor(private readonly prismaService: PrismaService) {}

  async getStatus() {
    const hasSuperAdmin = await this.prismaService.userRole.findFirst({
      where: {
        role: {
          name: {
            equals: 'Super Admin',
            mode: 'insensitive',
          },
        },
      },
      take: 1,
    });

    return new SetupStatusDto({ isFirstTimeSetup: !hasSuperAdmin });
  }
}
