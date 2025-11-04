import { ResourceGuard } from '@/modules/common/guards';
import { Permission } from '@longpoint/types';
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';

export const REQUIRE_PERMISSION_METADATA_KEY = 'require-permission';

/**
 * Require a permission for a method or controller
 * @param permission - The permission to require
 * @param options
 */
export const RequirePermission = (permission: Permission) => {
  return applyDecorators(
    SetMetadata(REQUIRE_PERMISSION_METADATA_KEY, {
      permission,
    }),
    UseGuards(ResourceGuard)
  );
};

export interface RequirePermissionMetadata {
  permission: Permission;
}
