import { Injectable } from '@nestjs/common';
import { ClassifierNotFound, MediaAssetNotFound } from '../../errors';
import { AiPluginService } from '../ai-plugin/ai-plugin.service';
import { CommonMediaService } from '../common-media/common-media.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommonClassifierService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly commonMediaService: CommonMediaService,
    private readonly aiPluginService: AiPluginService
  ) {}

  async runClassifier(mediaAssetId: string, classifierName: string) {
    const classifier = await this.getClassifier(classifierName);
    const model = await this.aiPluginService.getModelOrThrow(
      classifier.modelId
    );
    const mediaAsset = await this.getMediaAsset(mediaAssetId);

    const result = await model.classify(mediaAsset.url);

    return result;
  }

  private async getClassifier(name: string) {
    const classifier = await this.prismaService.classifier.findUnique({
      where: {
        name,
      },
      select: {
        modelId: true,
        modelConfig: true,
      },
    });

    if (!classifier) {
      throw new ClassifierNotFound(name);
    }

    return classifier;
  }

  private async getMediaAsset(mediaAssetId: string) {
    const mediaAsset = await this.prismaService.mediaAsset.findUnique({
      where: {
        id: mediaAssetId,
      },
      select: {
        mimeType: true,
        containerId: true,
      },
    });

    if (!mediaAsset) {
      throw new MediaAssetNotFound(mediaAssetId);
    }

    return this.commonMediaService.hydrateAsset(
      mediaAsset.containerId,
      mediaAsset
    );
  }
}
