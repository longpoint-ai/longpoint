import { JsonObject } from '@longpoint/types';
import { ClassifierEventPayloads } from '../classifier';
import { MediaEventPayloads } from '../media';

// Base event payload type
export type EventPayload = JsonObject;

// Registered event payloads
export type EventPayloads = MediaEventPayloads & ClassifierEventPayloads;
export type Events = keyof EventPayloads;

export interface EventPublisher {
  publish<T extends Events>(event: T, payload: EventPayloads[T]): Promise<void>;
}
