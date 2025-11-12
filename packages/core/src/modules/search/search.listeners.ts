import { PrismaService } from '@/modules/common/services';
import { Injectable, Logger } from '@nestjs/common';
import { HandleEvent } from '../event';
import {
  type MediaAssetReadyEventPayload,
  type MediaContainerDeletedEventPayload,
  type MediaContainerReadyEventPayload,
} from '../media';
import { SearchIndexService } from './services/search-index.service';

@Injectable()
export class SearchListeners {
  private readonly logger = new Logger(SearchListeners.name);

  constructor(
    private readonly searchIndexService: SearchIndexService,
    private readonly prismaService: PrismaService
  ) {}

  @HandleEvent('media.asset.ready')
  async handleMediaAssetReady(payload: MediaAssetReadyEventPayload) {
    const container = await this.prismaService.mediaContainer.findUnique({
      where: { id: payload.containerId },
      select: { status: true },
    });

    if (container?.status === 'READY') {
      const activeIndex = await this.searchIndexService.getActiveIndex();
      if (activeIndex) {
        try {
          await activeIndex.indexContainer(payload.containerId);
        } catch (error) {
          this.logger.error(
            `Failed to index container ${
              payload.containerId
            } after asset ready: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
      }
    }
  }

  @HandleEvent('media.container.ready')
  async handleMediaContainerReady(payload: MediaContainerReadyEventPayload) {
    const activeIndex = await this.searchIndexService.getActiveIndex();
    if (activeIndex) {
      try {
        await activeIndex.indexContainer(payload.containerId);
      } catch (error) {
        this.logger.error(
          `Failed to index container ${
            payload.containerId
          } after container ready: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
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
