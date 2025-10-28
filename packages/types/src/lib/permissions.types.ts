export const Permission = {
  MEDIA_CONTAINER_CREATE: 'media:create',
  MEDIA_CONTAINER_READ: 'media:read',
  MEDIA_CONTAINER_UPDATE: 'media:update',
  MEDIA_CONTAINER_DELETE: 'media:delete',
  CLASSIFIER_CREATE: 'classifier:create',
  CLASSIFIER_READ: 'classifier:read',
  CLASSIFIER_UPDATE: 'classifier:update',
  CLASSIFIER_DELETE: 'classifier:delete',
  SUPER: 'super',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
