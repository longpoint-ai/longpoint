import { SearchIndexItemStatus } from '@/database';
import { PrismaService } from '@/modules/common/services';
import { MediaContainerService } from '@/modules/media';
import { Injectable, Logger } from '@nestjs/common';
import { SearchIndexNotFound } from '../search.errors';
import { VectorProviderService } from './vector-provider.service';

@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly vectorProviderService: VectorProviderService,
    private readonly mediaContainerService: MediaContainerService // private readonly aiPluginService: AiPluginService
  ) {}

  async createIndex() {}

  async indexMediaContainer(indexId: string, mediaContainerId: string) {
    const index = await this.prismaService.searchIndex.findUnique({
      where: {
        id: indexId,
      },
    });

    if (!index) {
      throw new SearchIndexNotFound(indexId);
    }

    const mediaContainer =
      await this.mediaContainerService.getMediaContainerByIdOrThrow(
        mediaContainerId
      );
    const vectorProvider =
      await this.vectorProviderService.getProviderByIdOrThrow(
        index.vectorProviderId
      );

    await this.prismaService.searchIndexItem.upsert({
      where: {
        indexId_mediaContainerId: {
          indexId,
          mediaContainerId,
        },
      },
      create: {
        indexId,
        mediaContainerId,
        status: SearchIndexItemStatus.INDEXING,
      },
      update: {
        status: SearchIndexItemStatus.INDEXING,
        errorMessage: null,
      },
    });

    try {
      const embeddingText = mediaContainer.toEmbeddingText();

      if (!index.embeddingModelId) {
        await vectorProvider.embedAndUpsert(indexId, [
          {
            id: mediaContainerId,
            text: embeddingText,
          },
        ]);
      } else {
        // TODO: Handle after embedding model is implemented
        // const model = this.aiPluginService.getModelOrThrow(index.embeddingModelId);
        // const embedding = await model.createEmbedding(embeddingText);
        // await vectorProvider.upsert(indexId, [
        //   {
        //     id: mediaContainerId,
        //     embedding,
        //   },
        // ]);
      }

      await this.prismaService.searchIndexItem.update({
        where: {
          indexId_mediaContainerId: {
            indexId,
            mediaContainerId,
          },
        },
        data: {
          status: SearchIndexItemStatus.INDEXED,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to index container ${mediaContainerId}: ${errorMessage}`
      );
      await this.prismaService.searchIndexItem.update({
        where: {
          indexId_mediaContainerId: {
            indexId,
            mediaContainerId,
          },
        },
        data: {
          status: SearchIndexItemStatus.FAILED,
          errorMessage,
        },
      });

      throw error;
    }
  }
}
