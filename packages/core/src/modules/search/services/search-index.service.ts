import { Prisma, SearchIndexItemStatus } from '@/database';
import { AiPluginService } from '@/modules/ai';
import { PrismaService } from '@/modules/common/services';
import { MediaContainerService } from '@/modules/media';
import { Injectable, Logger } from '@nestjs/common';
import { CreateSearchIndexDto } from '../dtos';
import { SearchIndexEntity } from '../entities';
import {
  NativeEmbeddingNotSupported,
  SearchIndexNotFound,
} from '../search.errors';
import { VectorProviderService } from './vector-provider.service';

@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly vectorProviderService: VectorProviderService,
    private readonly mediaContainerService: MediaContainerService,
    private readonly aiPluginService: AiPluginService
  ) {}

  async createIndex(data: CreateSearchIndexDto) {
    const vectorProvider =
      await this.vectorProviderService.getProviderByIdOrThrow(
        data.vectorProviderId
      );

    let embeddingModelId = data.embeddingModelId;

    if (!embeddingModelId && !vectorProvider.supportsEmbedding) {
      throw new NativeEmbeddingNotSupported(vectorProvider.id);
    }

    if (embeddingModelId) {
      // TODO: Handle custom embedding model
      throw new Error('Custom embedding model not yet supported');
    }

    const index = await this.prismaService.searchIndex.create({
      data: {
        vectorProviderId: vectorProvider.id,
        embeddingModelId,
      },
    });

    if (data.active) {
      await this.makeActiveIndex(index.id);
    }

    return new SearchIndexEntity({
      id: index.id,
      active: index.active,
      indexing: index.indexing,
      embeddingModel: null,
      vectorProvider,
      lastIndexedAt: index.lastIndexedAt,
      mediaIndexed: 0,
    });
  }

  async listIndexes(): Promise<SearchIndexEntity[]> {
    const indexes = await this.prismaService.searchIndex.findMany({
      select: {
        id: true,
        active: true,
        indexing: true,
        lastIndexedAt: true,
        mediaIndexed: true,
        vectorProviderId: true,
        embeddingModelId: true,
      },
      orderBy: [{ active: 'desc' }, { lastIndexedAt: 'desc' }],
    });

    const indexEntities: SearchIndexEntity[] = [];

    for (const index of indexes) {
      const vectorProvider =
        await this.vectorProviderService.getProviderByIdOrThrow(
          index.vectorProviderId
        );
      const embeddingModel = index.embeddingModelId
        ? await this.aiPluginService.getModelOrThrow(index.embeddingModelId)
        : null;
      indexEntities.push(
        new SearchIndexEntity({
          id: index.id,
          active: index.active,
          indexing: index.indexing,
          lastIndexedAt: index.lastIndexedAt,
          mediaIndexed: index.mediaIndexed,
          vectorProvider,
          embeddingModel,
        })
      );
    }

    return indexEntities;
  }

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

  private async makeActiveIndex(
    indexId: string,
    tx?: Prisma.TransactionClient
  ) {
    const activate = async (tx: Prisma.TransactionClient) => {
      await tx.searchIndex.updateMany({
        where: {
          active: true,
        },
        data: {
          active: false,
        },
      });

      await tx.searchIndex.update({
        where: {
          id: indexId,
        },
        data: {
          active: true,
        },
      });
    };

    if (tx) {
      await activate(tx);
    } else {
      await this.prismaService.$transaction(activate);
    }
  }
}
