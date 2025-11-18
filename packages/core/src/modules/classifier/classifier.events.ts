import { EventPayload } from '../event/event.types';

export const ClassifierEvents = {
  CLASSIFIER_RUN_COMPLETE: 'classifier.run.complete',
} as const;

export type ClassifierEvents =
  (typeof ClassifierEvents)[keyof typeof ClassifierEvents];

export interface ClassifierRunCompleteEventPayload extends EventPayload {
  mediaContainerId: string;
}

export interface ClassifierEventPayloads {
  [ClassifierEvents.CLASSIFIER_RUN_COMPLETE]: ClassifierRunCompleteEventPayload;
}
