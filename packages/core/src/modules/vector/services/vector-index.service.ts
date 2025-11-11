import { VectorDocumentStatus } from '@/database';
import { PrismaService } from '@/modules/common/services';
import { MediaContainerService } from '@/modules/media';
import { Injectable, Logger } from '@nestjs/common';
import { VectorIndexNotFound } from '../vector.errors';
import { VectorProviderService } from './vector-provider.service';

@Injectable()
export class VectorIndexService {
  private readonly logger = new Logger(VectorIndexService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly vectorProviderService: VectorProviderService,
    private readonly mediaContainerService: MediaContainerService // private readonly aiPluginService: AiPluginService
  ) {}

  async indexMediaContainer(indexId: string, mediaContainerId: string) {
    const index = await this.prismaService.vectorIndex.findUnique({
      where: {
        id: indexId,
      },
    });

    if (!index) {
      throw new VectorIndexNotFound(indexId);
    }

    const mediaContainer =
      await this.mediaContainerService.getMediaContainerByIdOrThrow(
        mediaContainerId
      );
    const vectorProvider =
      await this.vectorProviderService.getProviderByIdOrThrow(
        index.vectorProviderId
      );

    await this.prismaService.vectorDocument.upsert({
      where: {
        mediaContainerId,
      },
      create: {
        mediaContainerId,
        indexId,
        status: VectorDocumentStatus.INDEXING,
      },
      update: {
        status: VectorDocumentStatus.INDEXING,
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

      await this.prismaService.vectorDocument.update({
        where: {
          mediaContainerId,
        },
        data: {
          status: VectorDocumentStatus.INDEXED,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to index container ${mediaContainerId}: ${errorMessage}`
      );
      await this.prismaService.vectorDocument.update({
        where: {
          mediaContainerId,
        },
        data: {
          status: VectorDocumentStatus.FAILED,
          errorMessage,
        },
      });

      throw error;
    }
  }
}
