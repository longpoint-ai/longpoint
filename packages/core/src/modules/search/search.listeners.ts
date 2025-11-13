import { PrismaService } from '@/modules/common/services';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HandleEvent } from '../event';
import {
  type MediaAssetReadyEventPayload,
  type MediaContainerDeletedEventPayload,
  type MediaContainerReadyEventPayload,
} from '../media';
import { QueueService } from '../queue';
import { SearchIndexService } from './services/search-index.service';

const QUEUE_NAME = 'sync-index';
const SYNC_JOB_ID = 'sync-active-index';

@Injectable()
export class SearchListeners implements OnModuleInit {
  private readonly logger = new Logger(SearchListeners.name);

  constructor(
    private readonly searchIndexService: SearchIndexService,
    private readonly prismaService: PrismaService,
    private readonly queueService: QueueService
  ) {}

  async onModuleInit() {
    this.queueService.process(QUEUE_NAME, async () => {
      const activeIndex = await this.searchIndexService.getActiveIndex();
      if (activeIndex) {
        try {
          await activeIndex.sync();
        } catch (error) {
          this.logger.error(
            `Failed to sync active index: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
      }
    });
  }

  @HandleEvent('media.asset.ready')
  async handleMediaAssetReady(payload: MediaAssetReadyEventPayload) {
    const container = await this.prismaService.mediaContainer.findUnique({
      where: { id: payload.containerId },
      select: { status: true },
    });

    if (container?.status === 'READY') {
      try {
        await this.queueService.add(
          QUEUE_NAME,
          {},
          {
            jobId: SYNC_JOB_ID,
            delay: 5000,
          }
        );
      } catch (error) {
        this.logger.error(
          `Failed to queue sync job after asset ready: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
  }

  @HandleEvent('media.container.ready')
  async handleMediaContainerReady(payload: MediaContainerReadyEventPayload) {
    try {
      await this.queueService.add(
        QUEUE_NAME,
        {},
        {
          jobId: SYNC_JOB_ID,
          delay: 5000,
        }
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue sync job after container ready: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  @HandleEvent('media.container.deleted')
  async handleMediaContainerDeleted(
    payload: MediaContainerDeletedEventPayload
  ) {
    try {
      await this.searchIndexService.removeMediaContainer(payload.containerId);
    } catch (error) {
      this.logger.error(
        `Failed to remove container ${payload.containerId} from indexes: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
