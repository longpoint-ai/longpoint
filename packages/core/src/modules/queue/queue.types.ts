import { JsonObject } from '@longpoint/types';

export type JobData = JsonObject;

export interface QueueJobOptions {
  delay?: number;
  attempts?: number;
  jobId?: string;
  priority?: number;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

export interface QueueJob<T extends JobData = JobData> {
  id: string;
  name: string;
  data: T;
  attemptsMade: number;
  timestamp: number;
  opts: QueueJobOptions;
}

export type QueueProcessor<T extends JobData = JobData> = (
  job: QueueJob<T>
) => Promise<void>;

export type QueueBehavior = 'debounce' | 'fifo' | 'lifo' | 'concurrent';

export interface DebounceQueueConfig {
  behavior: 'debounce';
  batchDelayMs?: number;
  maxBatchSize?: number;
  chunkSize?: number;
}

export interface FifoQueueConfig {
  behavior: 'fifo';
  concurrency?: number;
}

export interface LifoQueueConfig {
  behavior: 'lifo';
  concurrency?: number;
}

export interface ConcurrentQueueConfig {
  behavior: 'concurrent';
  concurrency: number;
}

export type QueueConfig =
  | DebounceQueueConfig
  | FifoQueueConfig
  | LifoQueueConfig
  | ConcurrentQueueConfig;
