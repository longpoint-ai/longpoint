import { Prisma } from '@/database';
import { ConfigValues } from '@longpoint/devkit';
import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dtos/pagination';
import { ClassifierNotFound, InvalidInput } from '../common/errors';
import {
  selectClassifier,
  SelectedClassifier,
} from '../common/selectors/classifier.selectors';
import { AiPluginService, PrismaService } from '../common/services';
import { EncryptionService } from '../common/services/encryption/encryption.service';
import { ClassifierDto, ClassifierParams } from './dtos/classifier.dto';
import { CreateClassifierDto } from './dtos/create-classifier.dto';
import { ListClassifiersResponseDto } from './dtos/list-classifiers-response.dto';
import { UpdateClassifierDto } from './dtos/update-classifier.dto';

@Injectable()
export class ClassifierService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly aiPluginService: AiPluginService,
    private readonly encryptionService: EncryptionService
  ) {}

  async createClassifier(data: CreateClassifierDto) {
    const modelConfig = data.modelConfig ?? undefined;

    const encryptedModelConfig = await this.processModelConfig(
      data.modelId,
      modelConfig
    );

    const classifier = await this.prismaService.classifier.create({
      data: {
        name: data.name,
        description: data.description,
        modelId: data.modelId,
        modelConfig: encryptedModelConfig,
      },
      select: selectClassifier(),
    });

    const hydrated = await this.hydrateClassifier(classifier);

    return new ClassifierDto(hydrated);
  }

  async getClassifier(id: string) {
    const classifier = await this.prismaService.classifier.findUnique({
      where: {
        id,
      },
      select: selectClassifier(),
    });

    if (!classifier) {
      throw new ClassifierNotFound(id);
    }

    const hydrated = await this.hydrateClassifier(classifier);

    return new ClassifierDto(hydrated);
  }

  async listClassifiers(query: PaginationQueryDto) {
    const classifiers = await this.prismaService.classifier.findMany({
      ...query.toPrisma(),
      select: selectClassifier(),
    });

    const hydrated = await Promise.all(
      classifiers.map((classifier) => this.hydrateClassifier(classifier))
    );

    return new ListClassifiersResponseDto({
      query,
      items: hydrated,
      path: '/ai/classifiers',
    });
  }

  async updateClassifier(id: string, data: UpdateClassifierDto) {
    const classifier = await this.prismaService.classifier.findUnique({
      where: {
        id,
      },
      select: {
        modelId: true,
        modelConfig: true,
      },
    });

    if (!classifier) {
      throw new ClassifierNotFound(id);
    }

    const oldModelId = classifier.modelId;
    const oldModelConfig = classifier.modelConfig as ConfigValues | undefined;
    const newModelId = data.modelId;
    const newModelConfig = data.modelConfig ?? undefined;

    let modelConfigToUpdate: ConfigValues | undefined;

    if (newModelId && !newModelConfig) {
      modelConfigToUpdate = await this.processModelConfig(
        newModelId,
        oldModelConfig
      );
    } else if (newModelConfig && !newModelId) {
      modelConfigToUpdate = await this.processModelConfig(
        oldModelId,
        newModelConfig
      );
    } else if (newModelConfig && newModelId) {
      modelConfigToUpdate = await this.processModelConfig(
        newModelId,
        newModelConfig
      );
    }

    const updatedClassifier = await this.prismaService.classifier.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        description: data.description,
        modelId: data.modelId,
        modelConfig:
          data.modelConfig === null ? Prisma.JsonNull : modelConfigToUpdate,
      },
      select: selectClassifier(),
    });

    const hydrated = await this.hydrateClassifier(updatedClassifier);

    return new ClassifierDto(hydrated);
  }

  async deleteClassifier(id: string) {
    try {
      await this.prismaService.classifier.delete({
        where: {
          id,
        },
      });
    } catch (e) {
      if (PrismaService.isNotFoundError(e)) {
        throw new ClassifierNotFound(id);
      }
      throw e;
    }
  }

  /**
   * Validate and encrypt (if necessary) the model configuration.
   * @param fullModelId - The fully qualified model ID.
   * @param modelConfig - The model configuration to process.
   * @returns The processed model configuration.
   */
  private async processModelConfig(
    fullModelId: string,
    modelConfig?: ConfigValues
  ) {
    const model = this.aiPluginService.getModelOrThrow(fullModelId);
    const validationResult = model.validateClassifierInput(modelConfig);

    if (!validationResult.valid) {
      throw new InvalidInput(validationResult.errors);
    }

    const encryptedModelConfig = this.encryptionService.encryptConfigValues(
      modelConfig ?? {},
      model.classifierInputSchema
    );

    return encryptedModelConfig;
  }

  private async hydrateClassifier(
    classifier: SelectedClassifier
  ): Promise<ClassifierParams> {
    const model = await this.aiPluginService.getModelOrThrow(
      classifier.modelId
    );
    return {
      ...classifier,
      model: model.toJson(),
      modelConfigSchema: model.classifierInputSchema,
    };
  }
}
