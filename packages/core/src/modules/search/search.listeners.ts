import { DebounceTaskExecutor } from '@/shared/utils/debounce-task.executor';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import type { ClassifierRunCompleteEventPayload } from '../classifier';
import { HandleEvent } from '../event';
import {
  type MediaContainerDeletedEventPayload,
  type MediaContainerReadyEventPayload,
} from '../media';
import { SearchIndexService } from './services/search-index.service';

@Injectable()
export class SearchListeners implements OnModuleDestroy {
  private readonly indexExecutor: DebounceTaskExecutor;

  constructor(private readonly searchIndexService: SearchIndexService) {
    this.indexExecutor = new DebounceTaskExecutor(
      async () => {
        const activeIndex = await this.searchIndexService.getActiveIndex();
        if (activeIndex) {
          await activeIndex.sync();
        }
      },
      {
        name: 'SearchIndexSync',
        debounceMs: 1000,
        maxDebounceMs: 5000,
        maxRetries: 3,
        retryDelayMs: 1000,
      }
    );
  }

  @HandleEvent('media.container.ready')
  async handleMediaContainerReady(payload: MediaContainerReadyEventPayload) {
    await this.indexExecutor.requestRun();
  }

  @HandleEvent('media.container.deleted')
  async handleMediaContainerDeleted(
    payload: MediaContainerDeletedEventPayload
  ) {
    await this.indexExecutor.requestRun();
  }

  @HandleEvent('classifier.run.complete')
  async handleClassifierRunComplete(
    payload: ClassifierRunCompleteEventPayload
  ) {
    const activeIndex = await this.searchIndexService.getActiveIndex();
    if (activeIndex) {
      await activeIndex.markContainersAsStale([payload.mediaContainerId]);
      await this.indexExecutor.requestRun();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.indexExecutor.close();
  }
}
