import { Prisma } from '@/database';
import { ConfigValues } from '@longpoint/devkit';
import { Injectable } from '@nestjs/common';
import { ClassifierNotFound, InvalidInput } from '../common/errors';
import {
  selectClassifier,
  SelectedClassifier,
} from '../common/selectors/classifier.selectors';
import { AiPluginService, PrismaService } from '../common/services';
import { EncryptionService } from '../common/services/encryption/encryption.service';
import { ClassifierSummaryDto } from './dtos/classifier-summary.dto';
import { ClassifierDto, ClassifierParams } from './dtos/classifier.dto';
import { CreateClassifierDto } from './dtos/create-classifier.dto';
import { UpdateClassifierDto } from './dtos/update-classifier.dto';

@Injectable()
export class ClassifierService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly aiPluginService: AiPluginService,
    private readonly encryptionService: EncryptionService
  ) {}

  async createClassifier(data: CreateClassifierDto) {
    const modelInput = data.modelInput ?? undefined;

    const processedModelInput = await this.processModelInputValues(
      data.modelId,
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

  async listClassifiers() {
    const classifiers = await this.prismaService.classifier.findMany({
      select: selectClassifier(),
    });

    const hydrated = await Promise.all(
      classifiers.map(async (classifier) => {
        const hydrated = await this.hydrateClassifier(classifier);
        return new ClassifierSummaryDto(hydrated);
      })
    );

    return hydrated;
  }

  async updateClassifier(id: string, data: UpdateClassifierDto) {
    const classifier = await this.prismaService.classifier.findUnique({
      where: {
        id,
      },
      select: {
        modelId: true,
        modelInput: true,
      },
    });

    if (!classifier) {
      throw new ClassifierNotFound(id);
    }

    const oldModelId = classifier.modelId;
    const oldModelInput = classifier.modelInput as ConfigValues | undefined;
    const newModelId = data.modelId;
    const newModelInput = data.modelInput ?? undefined;

    let modelInputToUpdate: ConfigValues | undefined;

    if (newModelId && !newModelInput) {
      modelInputToUpdate = await this.processModelInputValues(
        newModelId,
        oldModelInput
      );
    } else if (newModelInput && !newModelId) {
      modelInputToUpdate = await this.processModelInputValues(
        oldModelId,
        newModelInput
      );
    } else if (newModelInput && newModelId) {
      modelInputToUpdate = await this.processModelInputValues(
        newModelId,
        newModelInput
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
        modelInput:
          data.modelInput === null ? Prisma.JsonNull : modelInputToUpdate,
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
   * @param modelInput - The model configuration to process.
   * @returns The processed model configuration.
   */
  private async processModelInputValues(
    fullModelId: string,
    modelInput?: ConfigValues
  ) {
    const model = this.aiPluginService.getModelOrThrow(fullModelId);
    const validationResult = model.validateClassifierInput(modelInput);

    if (!validationResult.valid) {
      throw new InvalidInput(validationResult.errors);
    }

    const encryptedModelInput = this.encryptionService.encryptConfigValues(
      modelInput ?? {},
      model.classifierInputSchema
    );

    return encryptedModelInput;
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
      modelInputSchema: model.classifierInputSchema,
    };
  }
}
