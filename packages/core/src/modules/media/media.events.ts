import { EventPayload } from '../event/event.types';

export const MediaEvents = {
  MEDIA_ASSET_READY: 'media.asset.ready',
  MEDIA_ASSET_FAILED: 'media.asset.failed',
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

export interface MediaEventPayloads {
  [MediaEvents.MEDIA_ASSET_READY]: MediaAssetReadyEventPayload;
  [MediaEvents.MEDIA_ASSET_FAILED]: MediaAssetFailedEventPayload;
}
