import { Permission } from '@longpoint/types';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PUBLIC_METADATA_KEY } from '../decorators';
import {
  REQUIRE_PERMISSION_METADATA_KEY,
  RequirePermissionMetadata,
} from '../decorators/require-permissions.decorator';
import { PrismaService } from '../services';
import { getHttpRequest } from '../utils/http.utils';

@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_METADATA_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (isPublic) {
      return true;
    }

    const resourceMetadata =
      this.reflector.getAllAndOverride<RequirePermissionMetadata>(
        REQUIRE_PERMISSION_METADATA_KEY,
        [context.getHandler(), context.getClass()]
      );

    if (!resourceMetadata) {
      return true;
    }

    const request = getHttpRequest(context);

    if (!request.user) {
      return false;
    }

    const hasPermission = await this.checkPermission(
      resourceMetadata.permission,
      request.user.id
    );

    return hasPermission;
  }

  private async checkPermission(permission: Permission, userId: string) {
    const rolePermission = await this.prismaService.rolePermission.findFirst({
      where: {
        role: {
          userRoles: {
            some: {
              userId,
            },
          },
        },
        OR: [{ permission }, { permission: Permission.SUPER }],
      },
    });

    return !!rolePermission;
  }
}
