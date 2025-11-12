import { SearchIndexItemStatus } from '@/database';
import { AiModelEntity } from '@/modules/ai';
import { PrismaService } from '@/modules/common/services';
import { MediaContainerService } from '@/modules/media';
import { Logger } from '@nestjs/common';
import { SearchIndexDto } from '../dtos';
import { VectorProviderEntity } from './vector-provider.entity';

export interface SearchIndexEntityArgs {
  id: string;
  active: boolean;
  indexing: boolean;
  name: string;
  mediaIndexed: number;
  lastIndexedAt: Date | null;
  vectorProvider: VectorProviderEntity;
  embeddingModel: AiModelEntity | null;
  mediaContainerService: MediaContainerService;
  prismaService: PrismaService;
}

export class SearchIndexEntity {
  readonly id: string;
  private _active: boolean;
  private _indexing: boolean;
  private _name: string;
  private _mediaIndexed: number;
  private _lastIndexedAt: Date | null;
  private readonly vectorProvider: VectorProviderEntity;
  private readonly embeddingModel: AiModelEntity | null;
  private readonly mediaContainerService: MediaContainerService;
  private readonly prismaService: PrismaService;
  private readonly logger = new Logger(SearchIndexEntity.name);

  constructor(args: SearchIndexEntityArgs) {
    this.id = args.id;
    this._active = args.active;
    this._indexing = args.indexing;
    this._name = args.name;
    this._mediaIndexed = args.mediaIndexed;
    this._lastIndexedAt = args.lastIndexedAt;
    this.vectorProvider = args.vectorProvider;
    this.embeddingModel = args.embeddingModel;
    this.mediaContainerService = args.mediaContainerService;
    this.prismaService = args.prismaService;
  }

  /**
   * Adds a media container to this index.
   * @param mediaContainerId The ID of the media container to index
   */
  async indexContainer(mediaContainerId: string): Promise<void> {
    const mediaContainer =
      await this.mediaContainerService.getMediaContainerByIdOrThrow(
        mediaContainerId
      );

    await this.prismaService.searchIndexItem.upsert({
      where: {
        indexId_mediaContainerId: {
          indexId: this.id,
          mediaContainerId,
        },
      },
      create: {
        indexId: this.id,
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

      if (!this.embeddingModel) {
        await this.vectorProvider.embedAndUpsert(this.name, [
          {
            id: mediaContainerId,
            text: embeddingText,
          },
        ]);
      } else {
        // TODO: Handle after embedding model is implemented
        // const embedding = await this.embeddingModel.createEmbedding(embeddingText);
        // await this.vectorProvider.upsert(this.id, [
        //   {
        //     id: mediaContainerId,
        //     embedding,
        //   },
        // ]);
      }

      await this.prismaService.$transaction([
        this.prismaService.searchIndexItem.update({
          where: {
            indexId_mediaContainerId: {
              indexId: this.id,
              mediaContainerId,
            },
          },
          data: {
            status: SearchIndexItemStatus.INDEXED,
          },
        }),
        this.prismaService.searchIndex.update({
          where: { id: this.id },
          data: {
            mediaIndexed: {
              increment: 1,
            },
          },
        }),
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.prismaService.searchIndexItem.update({
        where: {
          indexId_mediaContainerId: {
            indexId: this.id,
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

  /**
   * Syncs the index with all `READY` media containers.
   */
  async sync(): Promise<void> {
    const currentIndex = await this.prismaService.searchIndex.findUnique({
      where: { id: this.id },
      select: { indexing: true },
    });

    if (currentIndex?.indexing) {
      return;
    }

    await this.prismaService.searchIndex.update({
      where: { id: this.id },
      data: { indexing: true },
    });

    try {
      const readyContainers = await this.prismaService.mediaContainer.findMany({
        where: {
          status: 'READY',
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      const indexedItems = await this.prismaService.searchIndexItem.findMany({
        where: {
          indexId: this.id,
          status: 'INDEXED',
        },
        select: {
          mediaContainerId: true,
        },
      });

      const indexedContainerIds = new Set(
        indexedItems.map((item) => item.mediaContainerId)
      );

      // Index containers that aren't already indexed
      for (const container of readyContainers) {
        if (!indexedContainerIds.has(container.id)) {
          try {
            await this.indexContainer(container.id);
          } catch (error) {
            // Continue with other containers even if one fails
            this.logger.error(
              `Failed to index container ${container.id}: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`
            );
          }
        }
      }

      const totalIndexed = await this.prismaService.searchIndexItem.count({
        where: {
          indexId: this.id,
          status: 'INDEXED',
        },
      });

      await this.prismaService.searchIndex.update({
        where: { id: this.id },
        data: {
          indexing: false,
          lastIndexedAt: new Date(),
          mediaIndexed: totalIndexed,
        },
      });
    } catch (error) {
      // Ensure indexing flag is cleared even on error
      await this.prismaService.searchIndex.update({
        where: { id: this.id },
        data: { indexing: false },
      });
      throw error;
    }
  }

  toDto(): SearchIndexDto {
    return new SearchIndexDto({
      id: this.id,
      active: this._active,
      indexing: this._indexing,
      name: this._name,
      embeddingModel: this.embeddingModel?.toSummaryDto() ?? null,
      vectorProvider: this.vectorProvider.toShortDto(),
      mediaIndexed: this._mediaIndexed,
      lastIndexedAt: this._lastIndexedAt,
    });
  }

  get active(): boolean {
    return this._active;
  }

  get indexing(): boolean {
    return this._indexing;
  }

  get mediaIndexed(): number {
    return this._mediaIndexed;
  }

  get lastIndexedAt(): Date | null {
    return this._lastIndexedAt;
  }

  get name(): string {
    return this._name;
  }
}
