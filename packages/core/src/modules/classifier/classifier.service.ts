import { ConfigValues } from '@longpoint/config-schema';
import { Injectable } from '@nestjs/common';
import { selectClassifier } from '../../shared/selectors/classifier.selectors';
import { AiPluginService } from '../ai';
import { PrismaService } from '../common/services';
import { EventPublisher } from '../event';
import { MediaContainerService } from '../media';
import { ClassifierNotFound } from './classifier.errors';
import { CreateClassifierDto } from './dtos/create-classifier.dto';
import { ClassifierEntity } from './entities';

@Injectable()
export class ClassifierService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly aiPluginService: AiPluginService,
    private readonly mediaContainerService: MediaContainerService,
    private readonly eventPublisher: EventPublisher
  ) {}

  async createClassifier(data: CreateClassifierDto) {
    const modelInput = data.modelInput ?? undefined;
    const model = this.aiPluginService.getModelOrThrow(data.modelId);
    const processedModelInput = await model.processInboundClassifierInput(
      modelInput
    );

    const classifier = await this.prismaService.classifier.create({
      data: {
        name: data.name,
        description: data.description,
        modelId: data.modelId,
        modelInput: processedModelInput,
      },
      select: selectClassifier(),
    });

    const classifierEntity = new ClassifierEntity({
      id: classifier.id,
      name: classifier.name,
      description: classifier.description,
      createdAt: classifier.createdAt,
      updatedAt: classifier.updatedAt,
      model,
      modelInput: processedModelInput,
      prismaService: this.prismaService,
      aiPluginService: this.aiPluginService,
      mediaContainerService: this.mediaContainerService,
      eventPublisher: this.eventPublisher,
    });

    return classifierEntity;
  }

  async getClassifierById(id: string) {
    const classifier = await this.prismaService.classifier.findUnique({
      where: {
        id,
      },
      select: selectClassifier(),
    });

    if (!classifier) {
      return null;
    }

    return new ClassifierEntity({
      ...classifier,
      model: this.aiPluginService.getModelOrThrow(classifier.modelId),
      prismaService: this.prismaService,
      aiPluginService: this.aiPluginService,
      modelInput: classifier.modelInput as ConfigValues,
      mediaContainerService: this.mediaContainerService,
      eventPublisher: this.eventPublisher,
    });
  }

  async getClassifierByIdOrThrow(id: string) {
    const classifier = await this.getClassifierById(id);
    if (!classifier) {
      throw new ClassifierNotFound(id);
    }
    return classifier;
  }

  async listClassifiers(): Promise<ClassifierEntity[]> {
    const classifiers = await this.prismaService.classifier.findMany({
      select: selectClassifier(),
    });

    return classifiers.map(
      (classifier) =>
        new ClassifierEntity({
          ...classifier,
          model: this.aiPluginService.getModelOrThrow(classifier.modelId),
          prismaService: this.prismaService,
          aiPluginService: this.aiPluginService,
          mediaContainerService: this.mediaContainerService,
          eventPublisher: this.eventPublisher,
        })
    );
  }
}
