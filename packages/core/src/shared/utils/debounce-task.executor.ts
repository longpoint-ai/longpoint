import { Logger } from '@nestjs/common';

interface DebounceTaskExecutorConfig {
  name?: string;
  debounceMs?: number;
  maxDebounceMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  silent?: boolean;
}

export class DebounceTaskExecutor {
  private readonly logger: Logger;

  private isRunning = false;
  private needsRun = false;
  private debounceTimer?: NodeJS.Timeout | null = null;
  private maxDebounceTimer?: NodeJS.Timeout | null = null;

  private readonly config: Required<DebounceTaskExecutorConfig>;

  constructor(
    private readonly fn: () => Promise<void>,
    config: DebounceTaskExecutorConfig = {}
  ) {
    this.config = {
      name: config.name ?? DebounceTaskExecutor.name,
      debounceMs: config.debounceMs ?? 1000,
      maxDebounceMs: config.maxDebounceMs ?? 5000,
      maxRetries: config.maxRetries ?? 3,
      retryDelayMs: config.retryDelayMs ?? 1000,
      silent: config.silent ?? false,
    };
    this.logger = new Logger(this.config.name);
  }

  async requestRun(): Promise<void> {
    this.needsRun = true;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (!this.maxDebounceTimer) {
      this.maxDebounceTimer = setTimeout(() => {
        this.maxDebounceTimer = null;
        this.triggerRun();
      }, this.config.maxDebounceMs);
    }

    this.debounceTimer = setTimeout(() => {
      if (this.maxDebounceTimer) {
        clearTimeout(this.maxDebounceTimer);
        this.maxDebounceTimer = null;
      }
      this.triggerRun();
    }, this.config.debounceMs);
  }

  async close(): Promise<void> {
    this.log(`shutting down`);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.maxDebounceTimer) {
      clearTimeout(this.maxDebounceTimer);
      this.maxDebounceTimer = null;
    }

    if (this.isRunning) {
      this.log(`waiting for running task to complete`);
      while (this.isRunning) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    if (this.needsRun) {
      this.log(`running final task`);
      await this.triggerRun();
    }

    this.log(`shutdown complete`);
  }

  private async triggerRun(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    // Ensure we process all pending requests, even if new ones arrive during execution
    while (this.needsRun) {
      this.isRunning = true;
      this.needsRun = false;

      let retryCount = 0;
      let success = false;

      while (retryCount <= this.config.maxRetries && !success) {
        try {
          await this.fn();
          success = true;
          this.logDebug(`completed successfully`);
        } catch (e) {
          retryCount++;

          if (retryCount <= this.config.maxRetries) {
            const delayMs =
              this.config.retryDelayMs * Math.pow(2, retryCount - 1);
            this.logWarn(
              `failed, retrying in ${delayMs}ms (attempt ${retryCount}/${
                this.config.maxRetries + 1
              })`
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else {
            this.logError(
              `failed after ${this.config.maxRetries + 1} attempts: ${
                e instanceof Error ? e.message : 'Unknown error'
              }`
            );
          }
        }
      }

      this.isRunning = false;
    }
  }

  private log(message: string): void {
    if (!this.config.silent) {
      this.logger.log(message);
    }
  }

  private logDebug(message: string): void {
    if (!this.config.silent) {
      this.logger.debug(message);
    }
  }

  private logWarn(message: string): void {
    if (!this.config.silent) {
      this.logger.warn(message);
    }
  }

  private logError(message: string): void {
    if (!this.config.silent) {
      this.logger.error(message);
    }
  }
}
