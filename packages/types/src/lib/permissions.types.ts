export const Permission = {
  AI_PROVIDER_READ: 'ai-provider:read',
  AI_PROVIDER_UPDATE: 'ai-provider:update',
  MEDIA_CONTAINER_CREATE: 'media:create',
  MEDIA_CONTAINER_READ: 'media:read',
  MEDIA_CONTAINER_UPDATE: 'media:update',
  MEDIA_CONTAINER_DELETE: 'media:delete',
  CLASSIFIER_CREATE: 'classifier:create',
  CLASSIFIER_READ: 'classifier:read',
  CLASSIFIER_UPDATE: 'classifier:update',
  CLASSIFIER_DELETE: 'classifier:delete',
  STORAGE_UNIT_CREATE: 'storage-unit:create',
  STORAGE_UNIT_READ: 'storage-unit:read',
  STORAGE_UNIT_UPDATE: 'storage-unit:update',
  STORAGE_UNIT_DELETE: 'storage-unit:delete',
  SETTINGS_PAGE_READ: 'settings-page:read',
  SUPER: 'super',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
