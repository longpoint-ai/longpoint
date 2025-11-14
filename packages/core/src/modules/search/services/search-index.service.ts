import { Prisma } from '@/database';
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
import { SelectedSearchIndex, selectSearchIndex } from '../search.selectors';
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

    let index = await this.prismaService.searchIndex.create({
      data: {
        name: data.name,
        vectorProviderId: vectorProvider.id,
        embeddingModelId,
      },
      select: selectSearchIndex(),
    });

    if (data.active) {
      index = await this.makeActiveIndex(index.id);
    }

    return new SearchIndexEntity({
      id: index.id,
      active: index.active,
      indexing: index.indexing,
      name: index.name,
      lastIndexedAt: index.lastIndexedAt,
      mediaIndexed: index.mediaIndexed,
      vectorProvider,
      embeddingModel: index.embeddingModelId
        ? await this.aiPluginService.getModelOrThrow(index.embeddingModelId)
        : null,
      mediaContainerService: this.mediaContainerService,
      prismaService: this.prismaService,
    });
  }

  async listIndexes(): Promise<SearchIndexEntity[]> {
    const indexes = await this.prismaService.searchIndex.findMany({
      select: selectSearchIndex(),
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
          name: index.name,
          lastIndexedAt: index.lastIndexedAt,
          mediaIndexed: index.mediaIndexed,
          vectorProvider,
          embeddingModel,
          mediaContainerService: this.mediaContainerService,
          prismaService: this.prismaService,
        })
      );
    }

    return indexEntities;
  }

  async getIndexById(indexId: string): Promise<SearchIndexEntity | null> {
    const index = await this.prismaService.searchIndex.findUnique({
      where: { id: indexId },
      select: selectSearchIndex(),
    });

    if (!index) {
      return null;
    }

    const vectorProvider =
      await this.vectorProviderService.getProviderByIdOrThrow(
        index.vectorProviderId
      );
    const embeddingModel = index.embeddingModelId
      ? await this.aiPluginService.getModelOrThrow(index.embeddingModelId)
      : null;

    return new SearchIndexEntity({
      id: index.id,
      active: index.active,
      indexing: index.indexing,
      name: index.name,
      lastIndexedAt: index.lastIndexedAt,
      mediaIndexed: index.mediaIndexed,
      vectorProvider,
      embeddingModel,
      mediaContainerService: this.mediaContainerService,
      prismaService: this.prismaService,
    });
  }

  async getIndexByIdOrThrow(id: string): Promise<SearchIndexEntity> {
    const index = await this.getIndexById(id);
    if (!index) {
      throw new SearchIndexNotFound(id);
    }
    return index;
  }

  async getActiveIndex(): Promise<SearchIndexEntity | null> {
    const index = await this.prismaService.searchIndex.findFirst({
      where: {
        active: true,
      },
      select: selectSearchIndex(),
    });

    if (!index) {
      return null;
    }

    const vectorProvider =
      await this.vectorProviderService.getProviderByIdOrThrow(
        index.vectorProviderId
      );
    const embeddingModel = index.embeddingModelId
      ? await this.aiPluginService.getModelOrThrow(index.embeddingModelId)
      : null;

    return new SearchIndexEntity({
      id: index.id,
      active: index.active,
      indexing: index.indexing,
      name: index.name,
      lastIndexedAt: index.lastIndexedAt,
      mediaIndexed: index.mediaIndexed,
      vectorProvider,
      embeddingModel,
      mediaContainerService: this.mediaContainerService,
      prismaService: this.prismaService,
    });
  }

  async removeMediaContainer(mediaContainerId: string): Promise<void> {
    const indexItems = await this.prismaService.searchIndexItem.findMany({
      where: {
        mediaContainerId,
      },
      select: {
        indexId: true,
        index: {
          select: {
            name: true,
            vectorProviderId: true,
          },
        },
      },
    });

    if (indexItems.length === 0) {
      return;
    }

    const indexes = new Map<string, { name: string; vectorProviderId: string }>(
      indexItems.map((item) => [
        item.indexId,
        {
          name: item.index.name,
          vectorProviderId: item.index.vectorProviderId,
        },
      ])
    );

    // Delete from vector providers
    for (const [_, index] of indexes) {
      const vectorProvider =
        await this.vectorProviderService.getProviderByIdOrThrow(
          index.vectorProviderId
        );

      try {
        await vectorProvider.deleteDocuments(index.name, [mediaContainerId]);
      } catch (error) {
        this.logger.error(
          `Failed to delete container ${mediaContainerId} from vector provider for index ${
            index.name
          }: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        // Continue with database cleanup even if vector provider deletion fails
      }
    }

    await this.prismaService.$transaction([
      this.prismaService.searchIndexItem.deleteMany({
        where: {
          mediaContainerId,
        },
      }),
      this.prismaService.searchIndex.updateMany({
        where: {
          id: {
            in: Array.from(indexes.keys()),
          },
        },
        data: {
          mediaIndexed: {
            decrement: 1,
          },
        },
      }),
    ]);
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

      return tx.searchIndex.update({
        where: {
          id: indexId,
        },
        data: {
          active: true,
        },
        select: selectSearchIndex(),
      });
    };

    let updatedIndex: SelectedSearchIndex;

    if (tx) {
      updatedIndex = await activate(tx);
    } else {
      updatedIndex = await this.prismaService.$transaction(activate);
    }

    // Trigger background sync after activation
    this.getActiveIndex()
      .then((index) => {
        if (index) {
          index.sync().catch((error) => {
            this.logger.error(
              `Failed to sync index ${index.id} after activation: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`
            );
          });
        }
      })
      .catch((error) => {
        this.logger.error(
          `Failed to get active index after activation: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      });

    return updatedIndex;
  }
}
