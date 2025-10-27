import { ClassifierRunStatus } from '@/database/generated/prisma';
import { ConfigValues } from '@longpoint/devkit';
import { Injectable, Logger } from '@nestjs/common';
import { ClassifierNotFound, MediaAssetNotFound } from '../../errors';
import { AiPluginService } from '../ai-plugin/ai-plugin.service';
import { CommonMediaService } from '../common-media/common-media.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommonClassifierService {
  private readonly logger = new Logger(CommonClassifierService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly commonMediaService: CommonMediaService,
    private readonly aiPluginService: AiPluginService
  ) {}

  async runClassifier(mediaAssetId: string, classifierName: string) {
    const classifier = await this.getClassifier(classifierName);
    const model = this.aiPluginService.getModelOrThrow(classifier.modelId);
    const mediaAsset = await this.getMediaAsset(mediaAssetId);

    if (!model.isMimeTypeSupported(mediaAsset.mimeType)) {
      this.logger.warn(
        `Model "${model.id}" does not support mime type "${mediaAsset.mimeType}" - skipping classifier run`
      );
      return;
    }

    if ((mediaAsset.size ?? 0) > model.maxFileSize) {
      this.logger.warn(
        `Media asset "${mediaAssetId}" is too large for model "${model.id}" - skipping classifier run`
      );
      return;
    }

    const classifierRun = await this.prismaService.classifierRun.create({
      data: {
        status: ClassifierRunStatus.PROCESSING,
        classifierId: classifier.id,
        mediaAssetId,
        startedAt: new Date(),
      },
    });

    try {
      const result = await model.classify({
        url: mediaAsset.url,
        modelConfig: classifier.modelConfig as ConfigValues,
      });

      await this.prismaService.classifierRun.update({
        where: {
          id: classifierRun.id,
        },
        data: {
          status: ClassifierRunStatus.SUCCESS,
          result,
          completedAt: new Date(),
        },
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';

      await this.prismaService.classifierRun.update({
        where: {
          id: classifierRun.id,
        },
        data: {
          status: ClassifierRunStatus.FAILED,
          errorMessage,
          completedAt: new Date(),
        },
      });

      this.logger.error(`Classifier ${classifierName} failed: ${errorMessage}`);
    }
  }

  private async getClassifier(name: string) {
    const classifier = await this.prismaService.classifier.findUnique({
      where: {
        name,
      },
      select: {
        id: true,
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
        size: true,
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
