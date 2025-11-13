import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  ConcurrentQueueConfig,
  DebounceQueueConfig,
  FifoQueueConfig,
  JobData,
  LifoQueueConfig,
  QueueConfig,
  QueueJob,
  QueueJobOptions,
  QueueProcessor,
} from './queue.types';

export abstract class QueueService {
  abstract add<T extends JobData>(
    name: string,
    data: T,
    options?: QueueJobOptions
  ): Promise<QueueJob<T>>;

  abstract process<T extends JobData>(
    name: string,
    processor: QueueProcessor<T>,
    config?: QueueConfig
  ): void;

  abstract remove(name: string, jobId: string): Promise<void>;

  abstract close(): Promise<void>;
}

interface QueueMetadata {
  processor: QueueProcessor;
  config: QueueConfig;
  timer?: NodeJS.Timeout;
  runningJobs: Set<string>;
}

@Injectable()
export class InMemoryQueueService
  extends QueueService
  implements OnModuleDestroy
{
  private readonly logger = new Logger(InMemoryQueueService.name);
  private readonly pendingJobs = new Map<string, Map<string, QueueJob>>();
  private readonly queueMetadata = new Map<string, QueueMetadata>();
  private readonly DEFAULT_DEBOUNCE_CONFIG: DebounceQueueConfig = {
    behavior: 'debounce',
    batchDelayMs: 5000,
    maxBatchSize: 50,
    chunkSize: 10,
  };

  async add<T extends JobData>(
    name: string,
    data: T,
    options?: QueueJobOptions
  ): Promise<QueueJob<T>> {
    const jobId = options?.jobId || `${name}-${Date.now()}-${Math.random()}`;
    const timestamp = Date.now();
    const delay = options?.delay || 0;

    const job: QueueJob<T> = {
      id: jobId,
      name,
      data,
      attemptsMade: 0,
      timestamp: timestamp + delay,
      opts: options || {},
    };

    if (!this.pendingJobs.has(name)) {
      this.pendingJobs.set(name, new Map());
    }

    const queue = this.pendingJobs.get(name)!;

    // Deduplication: if same jobId exists, replace it
    if (queue.has(jobId)) {
      this.logger.debug(`Replacing existing job ${jobId} in queue ${name}`);
    }

    queue.set(jobId, job);

    const metadata = this.queueMetadata.get(name);
    if (!metadata) {
      // Queue not configured yet, use default debounce behavior
      return job;
    }

    // Route to appropriate handler based on queue behavior
    switch (metadata.config.behavior) {
      case 'debounce':
        await this.handleDebounceAdd(name, metadata.config);
        break;
      case 'fifo':
        await this.handleFifoAdd(name, metadata.config);
        break;
      case 'lifo':
        await this.handleLifoAdd(name, metadata.config);
        break;
      case 'concurrent':
        await this.handleConcurrentAdd(name, metadata.config);
        break;
    }

    return job;
  }

  process<T extends JobData>(
    name: string,
    processor: QueueProcessor<T>,
    config?: QueueConfig
  ): void {
    const queueConfig: QueueConfig = config || this.DEFAULT_DEBOUNCE_CONFIG;

    this.queueMetadata.set(name, {
      processor: processor as QueueProcessor,
      config: queueConfig,
      runningJobs: new Set(),
    });

    // If there are already pending jobs, trigger processing based on behavior
    const queue = this.pendingJobs.get(name);
    if (queue && queue.size > 0) {
      switch (queueConfig.behavior) {
        case 'debounce':
          this.handleDebounceAdd(name, queueConfig);
          break;
        case 'fifo':
          this.handleFifoAdd(name, queueConfig);
          break;
        case 'lifo':
          this.handleLifoAdd(name, queueConfig);
          break;
        case 'concurrent':
          this.handleConcurrentAdd(name, queueConfig);
          break;
      }
    }
  }

  async remove(name: string, jobId: string): Promise<void> {
    const queue = this.pendingJobs.get(name);
    if (queue) {
      queue.delete(jobId);
    }
  }

  async close(): Promise<void> {
    // Clear all timers
    for (const metadata of this.queueMetadata.values()) {
      if (metadata.timer) {
        clearTimeout(metadata.timer);
      }
    }

    // Process all remaining jobs based on their configured behavior
    const queueNames = Array.from(this.pendingJobs.keys());
    for (const name of queueNames) {
      const metadata = this.queueMetadata.get(name);
      if (metadata) {
        await this.processQueue(name, metadata);
      }
    }

    // Clear all queues
    this.pendingJobs.clear();
    this.queueMetadata.clear();
  }

  private async handleDebounceAdd(
    name: string,
    config: DebounceQueueConfig
  ): Promise<void> {
    const metadata = this.queueMetadata.get(name);
    if (!metadata) return;

    const queue = this.pendingJobs.get(name);
    if (!queue) return;

    const batchDelayMs = config.batchDelayMs ?? 5000;
    const maxBatchSize = config.maxBatchSize ?? 50;

    // Clear existing timer
    if (metadata.timer) {
      clearTimeout(metadata.timer);
    }

    const queueSize = queue.size;

    if (queueSize >= maxBatchSize) {
      this.logger.debug(
        `Queue ${name} reached max batch size (${maxBatchSize}), processing immediately`
      );
      await this.processQueue(name, metadata);
    } else {
      // Schedule batch processing with debounce
      metadata.timer = setTimeout(() => {
        this.processQueue(name, metadata).catch((error) => {
          this.logger.error(
            `Failed to process batch for queue ${name}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        });
        if (metadata) {
          metadata.timer = undefined;
        }
      }, batchDelayMs);
    }
  }

  private async handleFifoAdd(
    name: string,
    config: FifoQueueConfig
  ): Promise<void> {
    const metadata = this.queueMetadata.get(name);
    if (!metadata) return;

    const concurrency = config.concurrency ?? 1;
    await this.processConcurrent(name, metadata, concurrency, 'fifo');
  }

  private async handleLifoAdd(
    name: string,
    config: LifoQueueConfig
  ): Promise<void> {
    const metadata = this.queueMetadata.get(name);
    if (!metadata) return;

    const concurrency = config.concurrency ?? 1;
    await this.processConcurrent(name, metadata, concurrency, 'lifo');
  }

  private async handleConcurrentAdd(
    name: string,
    config: ConcurrentQueueConfig
  ): Promise<void> {
    const metadata = this.queueMetadata.get(name);
    if (!metadata) return;

    await this.processConcurrent(name, metadata, config.concurrency, 'fifo');
  }

  // Generic processing method
  private async processQueue(
    name: string,
    metadata: QueueMetadata
  ): Promise<void> {
    const queue = this.pendingJobs.get(name);
    if (!queue || queue.size === 0) {
      return;
    }

    const { config } = metadata;

    // Get all jobs that are ready (timestamp <= now)
    const now = Date.now();
    const readyJobs = Array.from(queue.values()).filter(
      (job) => job.timestamp <= now
    );

    if (readyJobs.length === 0) {
      return;
    }

    switch (config.behavior) {
      case 'debounce':
        await this.processDebounce(name, metadata, readyJobs);
        break;
      case 'fifo':
        await this.processConcurrent(
          name,
          metadata,
          config.concurrency ?? 1,
          'fifo'
        );
        break;
      case 'lifo':
        await this.processConcurrent(
          name,
          metadata,
          config.concurrency ?? 1,
          'lifo'
        );
        break;
      case 'concurrent':
        await this.processConcurrent(
          name,
          metadata,
          config.concurrency,
          'fifo'
        );
        break;
    }
  }

  private async processDebounce(
    name: string,
    metadata: QueueMetadata,
    readyJobs: QueueJob[]
  ): Promise<void> {
    const queue = this.pendingJobs.get(name);
    if (!queue) return;

    const config = metadata.config as DebounceQueueConfig;
    const chunkSize = config.chunkSize ?? 10;

    // Process jobs in chunks
    for (let i = 0; i < readyJobs.length; i += chunkSize) {
      const chunk = readyJobs.slice(i, i + chunkSize);
      await this.processJobChunk(name, queue, metadata.processor, chunk);
    }
  }

  private async processConcurrent(
    name: string,
    metadata: QueueMetadata,
    concurrency: number,
    order: 'fifo' | 'lifo'
  ): Promise<void> {
    const queue = this.pendingJobs.get(name);
    if (!queue) return;

    const now = Date.now();
    const readyJobs = Array.from(queue.values())
      .filter((job) => job.timestamp <= now)
      .filter((job) => !metadata.runningJobs.has(job.id));

    if (readyJobs.length === 0) {
      return;
    }

    // Sort based on order
    if (order === 'lifo') {
      readyJobs.sort((a, b) => b.timestamp - a.timestamp);
    } else {
      readyJobs.sort((a, b) => a.timestamp - b.timestamp);
    }

    // Process up to concurrency limit
    const jobsToProcess = readyJobs.slice(0, concurrency);
    const promises = jobsToProcess.map((job) => {
      metadata.runningJobs.add(job.id);
      return this.processJob(name, queue, metadata.processor, job).finally(
        () => {
          metadata.runningJobs.delete(job.id);
        }
      );
    });

    await Promise.allSettled(promises);

    // Continue processing if there are more jobs and capacity
    if (readyJobs.length > concurrency) {
      // Schedule next batch
      setImmediate(() => {
        this.processConcurrent(name, metadata, concurrency, order).catch(
          (error) => {
            this.logger.error(
              `Failed to continue concurrent processing for queue ${name}: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`
            );
          }
        );
      });
    }
  }

  private async processJobChunk(
    name: string,
    queue: Map<string, QueueJob>,
    processor: QueueProcessor,
    chunk: QueueJob[]
  ): Promise<void> {
    const results = await Promise.allSettled(
      chunk.map((job) => processor(job))
    );

    // Handle results
    for (let j = 0; j < chunk.length; j++) {
      const result = results[j];
      const job = chunk[j];
      await this.handleJobResult(name, queue, job, result);
    }
  }

  private async processJob(
    name: string,
    queue: Map<string, QueueJob>,
    processor: QueueProcessor,
    job: QueueJob
  ): Promise<void> {
    const result = await Promise.allSettled([processor(job)]);
    await this.handleJobResult(name, queue, job, result[0]);
  }

  private async handleJobResult(
    name: string,
    queue: Map<string, QueueJob>,
    job: QueueJob,
    result: PromiseSettledResult<void>
  ): Promise<void> {
    if (result.status === 'fulfilled') {
      queue.delete(job.id);
    } else {
      // Handle failed jobs
      job.attemptsMade++;
      const maxAttempts = job.opts.attempts || 1;

      if (job.attemptsMade >= maxAttempts) {
        this.logger.error(
          `Job ${job.id} in queue ${name} failed after ${
            job.attemptsMade
          } attempts: ${
            result.reason instanceof Error
              ? result.reason.message
              : 'Unknown error'
          }`
        );

        if (job.opts.removeOnFail !== false) {
          queue.delete(job.id);
        }
      } else {
        // Retry: reschedule the job
        job.timestamp = Date.now() + (job.opts.delay || 0);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }
}
