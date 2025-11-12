import { EventPayload } from '../event/event.types';

export const MediaEvents = {
  MEDIA_ASSET_READY: 'media.asset.ready',
  MEDIA_ASSET_FAILED: 'media.asset.failed',
  MEDIA_CONTAINER_READY: 'media.container.ready',
  MEDIA_CONTAINER_DELETED: 'media.container.deleted',
} as const;

export type MediaEvents = (typeof MediaEvents)[keyof typeof MediaEvents];

export interface MediaAssetReadyEventPayload extends EventPayload {
  id: string;
  containerId: string;
}

export type MediaAssetFailedEventPayload = Pick<
  MediaAssetReadyEventPayload,
  'id' | 'containerId'
>;

export interface MediaContainerReadyEventPayload extends EventPayload {
  containerId: string;
}

export interface MediaContainerDeletedEventPayload extends EventPayload {
  containerId: string;
}

export interface MediaEventPayloads {
  [MediaEvents.MEDIA_ASSET_READY]: MediaAssetReadyEventPayload;
  [MediaEvents.MEDIA_ASSET_FAILED]: MediaAssetFailedEventPayload;
  [MediaEvents.MEDIA_CONTAINER_READY]: MediaContainerReadyEventPayload;
  [MediaEvents.MEDIA_CONTAINER_DELETED]: MediaContainerDeletedEventPayload;
}
