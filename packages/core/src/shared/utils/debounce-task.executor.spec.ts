import { DebounceTaskExecutor } from './debounce-task.executor';

describe('DebounceTaskExecutor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('basic debouncing', () => {
    it('should execute task after debounce period', async () => {
      const task = jest.fn().mockResolvedValue(undefined);
      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 100,
        maxDebounceMs: 500,
        silent: true,
      });

      executor.requestRun();
      expect(task).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      await Promise.resolve(); // Allow promises to settle

      expect(task).toHaveBeenCalledTimes(1);
    });

    it('should debounce multiple rapid requests into one execution', async () => {
      const task = jest.fn().mockResolvedValue(undefined);
      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 100,
        maxDebounceMs: 500,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(50);
      executor.requestRun();
      jest.advanceTimersByTime(50);
      executor.requestRun();
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      expect(task).toHaveBeenCalledTimes(1);
    });

    it('should reset debounce timer on each request', async () => {
      const task = jest.fn().mockResolvedValue(undefined);
      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 100,
        maxDebounceMs: 500,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(90);
      executor.requestRun(); // Reset timer
      jest.advanceTimersByTime(90);
      expect(task).not.toHaveBeenCalled();

      jest.advanceTimersByTime(10);
      await Promise.resolve();

      expect(task).toHaveBeenCalledTimes(1);
    });
  });

  describe('max debounce timeout', () => {
    it('should execute after maxDebounceMs even with continuous requests', async () => {
      const task = jest.fn().mockResolvedValue(undefined);
      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 100,
        maxDebounceMs: 500,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(90);
      executor.requestRun();
      jest.advanceTimersByTime(90);
      executor.requestRun();
      jest.advanceTimersByTime(90);
      executor.requestRun();
      jest.advanceTimersByTime(90);
      executor.requestRun();
      jest.advanceTimersByTime(90);
      executor.requestRun();

      expect(task).not.toHaveBeenCalled();

      // Should trigger after maxDebounceMs from first request
      jest.advanceTimersByTime(50); // Total: 500ms from first request
      await Promise.resolve();

      expect(task).toHaveBeenCalledTimes(1);
    });

    it('should clear maxDebounceTimer when debounce timer fires', async () => {
      const task = jest.fn().mockResolvedValue(undefined);
      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 100,
        maxDebounceMs: 500,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      expect(task).toHaveBeenCalledTimes(1);

      // Max timer should be cleared, so advancing more time shouldn't trigger again
      jest.advanceTimersByTime(400);
      await Promise.resolve();

      expect(task).toHaveBeenCalledTimes(1);
    });

    it('should create new maxDebounceTimer after previous one fires', async () => {
      const task = jest.fn().mockResolvedValue(undefined);
      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 100,
        maxDebounceMs: 200,
        silent: true,
      });

      // First series: simulate continuous requests that keep resetting debounceTimer
      // This ensures maxDebounceTimer is what actually triggers
      executor.requestRun();
      jest.advanceTimersByTime(50);
      executor.requestRun(); // Reset debounceTimer
      jest.advanceTimersByTime(50);
      executor.requestRun(); // Reset again
      jest.advanceTimersByTime(50);
      executor.requestRun(); // Reset again
      jest.advanceTimersByTime(50); // Total: 200ms - maxDebounceTimer should fire
      await Promise.resolve();
      expect(task).toHaveBeenCalledTimes(1);

      // Second series: should create new maxDebounceTimer
      executor.requestRun();
      jest.advanceTimersByTime(50);
      executor.requestRun(); // Reset debounceTimer
      jest.advanceTimersByTime(50);
      executor.requestRun(); // Reset again
      jest.advanceTimersByTime(50);
      executor.requestRun(); // Reset again
      jest.advanceTimersByTime(50); // Total: 200ms from second series start
      await Promise.resolve();
      expect(task).toHaveBeenCalledTimes(2);
    });
  });

  describe('retry logic', () => {
    it('should retry on failure with exponential backoff', async () => {
      const task = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce(undefined);

      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 10,
        maxDebounceMs: 100,
        maxRetries: 3,
        retryDelayMs: 50,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(10);
      await Promise.resolve();

      // First attempt fails, retryCount becomes 1
      // First retry delay: 50 * 2^(1-1) = 50ms
      await Promise.resolve();
      expect(task).toHaveBeenCalledTimes(1);

      // Advance timer for first retry delay and let promises settle
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      await Promise.resolve(); // Extra resolve to let retry attempt complete
      expect(task).toHaveBeenCalledTimes(2);

      // Second attempt fails, retryCount becomes 2
      // Second retry delay: 50 * 2^(2-1) = 100ms
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      await Promise.resolve(); // Extra resolve to let retry attempt complete
      expect(task).toHaveBeenCalledTimes(3);

      // Third attempt succeeds (no more retries needed)
      await Promise.resolve();
      expect(task).toHaveBeenCalledTimes(3);
    });

    it('should stop retrying after maxRetries', async () => {
      const task = jest.fn().mockRejectedValue(new Error('Always fails'));

      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 10,
        maxDebounceMs: 100,
        maxRetries: 2,
        retryDelayMs: 50,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(10);
      await Promise.resolve();

      // Initial attempt fails, retryCount becomes 1
      // First retry delay: 50 * 2^(1-1) = 50ms
      await Promise.resolve();
      expect(task).toHaveBeenCalledTimes(1);

      // First retry (attempt 2) after 50ms
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      await Promise.resolve(); // Extra resolve to let retry attempt complete
      expect(task).toHaveBeenCalledTimes(2);

      // Second attempt fails, retryCount becomes 2
      // Second retry delay: 50 * 2^(2-1) = 100ms
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      await Promise.resolve(); // Extra resolve to let retry attempt complete
      expect(task).toHaveBeenCalledTimes(3);

      // Third attempt fails, retryCount becomes 3
      // retryCount (3) > maxRetries (2), so no more retries
      await Promise.resolve();
      expect(task).toHaveBeenCalledTimes(3);

      // Should not retry again
      jest.advanceTimersByTime(200);
      await Promise.resolve();
      expect(task).toHaveBeenCalledTimes(3);
    });

    it('should not retry on success', async () => {
      const task = jest.fn().mockResolvedValue(undefined);

      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 10,
        maxDebounceMs: 100,
        maxRetries: 3,
        retryDelayMs: 50,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(10);
      await Promise.resolve();

      expect(task).toHaveBeenCalledTimes(1);

      // Should not retry
      jest.advanceTimersByTime(200);
      await Promise.resolve();
      expect(task).toHaveBeenCalledTimes(1);
    });
  });

  describe('race conditions', () => {
    it('should process new requests that arrive during execution', async () => {
      let resolveTask: () => void;
      const task = jest.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveTask = resolve;
          })
      );

      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 10,
        maxDebounceMs: 100,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(10);
      await Promise.resolve();

      // Task is now running
      expect(task).toHaveBeenCalledTimes(1);

      // New request arrives during execution
      executor.requestRun();

      // Complete first execution
      resolveTask!();
      await Promise.resolve();

      // Should process the new request
      jest.advanceTimersByTime(10);
      await Promise.resolve();

      expect(task).toHaveBeenCalledTimes(2);
    });

    it('should not execute concurrently', async () => {
      let resolveTask: () => void;
      const task = jest.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveTask = resolve;
          })
      );

      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 10,
        maxDebounceMs: 100,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(10);
      await Promise.resolve();

      // Task is running
      expect(task).toHaveBeenCalledTimes(1);

      // Try to trigger another run while first is executing
      executor.requestRun();
      jest.advanceTimersByTime(10);
      await Promise.resolve();

      // Should not start second execution yet
      expect(task).toHaveBeenCalledTimes(1);

      // Complete first execution
      resolveTask!();
      await Promise.resolve();

      // Now second execution should start
      await Promise.resolve();
      expect(task).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple rapid requests during execution', async () => {
      let resolveTask: () => void;
      const task = jest.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveTask = resolve;
          })
      );

      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 10,
        maxDebounceMs: 100,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(10);
      await Promise.resolve();

      // Multiple requests during execution
      executor.requestRun();
      executor.requestRun();
      executor.requestRun();

      resolveTask!();
      await Promise.resolve();

      // Should coalesce all requests into one additional execution
      jest.advanceTimersByTime(10);
      await Promise.resolve();

      expect(task).toHaveBeenCalledTimes(2);
    });
  });

  describe('shutdown behavior', () => {
    it('should execute pending task on close instead of canceling', async () => {
      const task = jest.fn().mockResolvedValue(undefined);
      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 100,
        maxDebounceMs: 500,
        silent: true,
      });

      executor.requestRun();
      await executor.close();

      // Close should execute the pending task
      expect(task).toHaveBeenCalledTimes(1);

      // Advance time - task should not execute again
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(task).toHaveBeenCalledTimes(1);
    });

    it('should wait for running task to complete before closing', async () => {
      let resolveTask: () => void;
      const task = jest.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveTask = resolve;
          })
      );

      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 10,
        maxDebounceMs: 100,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(10);
      await Promise.resolve();

      // Task is running, try to close
      const closePromise = executor.close();

      // Should wait (advance timers to allow the polling loop to run)
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(task).toHaveBeenCalledTimes(1);

      // Complete task
      resolveTask!();
      jest.advanceTimersByTime(100);
      await closePromise;

      expect(task).toHaveBeenCalledTimes(1);
    }, 10000);

    it('should execute pending task on close', async () => {
      const task = jest.fn().mockResolvedValue(undefined);
      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 100,
        maxDebounceMs: 500,
        silent: true,
      });

      executor.requestRun();
      await executor.close();

      expect(task).toHaveBeenCalledTimes(1);
    });

    it('should handle close when no task is pending', async () => {
      const task = jest.fn().mockResolvedValue(undefined);
      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 10,
        maxDebounceMs: 100,
        silent: true,
      });

      // No requests made
      await executor.close();

      expect(task).not.toHaveBeenCalled();
    });
  });

  describe('configuration', () => {
    it('should use default config values', async () => {
      const task = jest.fn().mockResolvedValue(undefined);
      const executor = new DebounceTaskExecutor(task, {
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(1000); // Default debounceMs
      await Promise.resolve();

      expect(task).toHaveBeenCalledTimes(1);
    });

    it('should use custom config values', async () => {
      const task = jest.fn().mockResolvedValue(undefined);
      const executor = new DebounceTaskExecutor(task, {
        name: 'custom-task',
        debounceMs: 50,
        maxDebounceMs: 200,
        maxRetries: 1,
        retryDelayMs: 25,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(50);
      await Promise.resolve();

      expect(task).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle task that throws non-Error objects', async () => {
      const task = jest.fn().mockRejectedValue('String error');
      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 10,
        maxDebounceMs: 100,
        maxRetries: 0,
        silent: true,
      });

      executor.requestRun();
      jest.advanceTimersByTime(10);
      await Promise.resolve();

      // Should not crash
      expect(task).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid close and requestRun calls', async () => {
      const task = jest.fn().mockResolvedValue(undefined);
      const executor = new DebounceTaskExecutor(task, {
        debounceMs: 10,
        maxDebounceMs: 100,
        silent: true,
      });

      executor.requestRun();
      const closePromise = executor.close();
      executor.requestRun(); // After close started - this sets needsRun=true again
      await closePromise;

      // Close executes the first pending task via triggerRun()
      // The new requestRun() sets needsRun=true, but close() already called triggerRun()
      // So it should execute the new request as well
      expect(task).toHaveBeenCalledTimes(2);

      // No more executions should happen
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(task).toHaveBeenCalledTimes(2);
    });
  });
});
