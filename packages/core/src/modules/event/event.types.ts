import { JsonObject } from '@longpoint/types';
import { MediaEventPayloads } from '../media';

// Base event payload type
export type EventPayload = JsonObject;

// Registered event payloads
export type EventPayloads = MediaEventPayloads;
export type Events = keyof EventPayloads;

export interface EventPublisher {
  publish<T extends Events>(event: T, payload: EventPayloads[T]): Promise<void>;
}
