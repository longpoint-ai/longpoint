import { Prisma } from '@/database';
import { ConfigValues } from '@longpoint/devkit';
import { validateConfigSchema } from '@longpoint/validations';
import { Injectable } from '@nestjs/common';
import { ClassifierNotFound, InvalidInput } from '../common/errors';
import {
  selectClassifier,
  SelectedClassifier,
} from '../common/selectors/classifier.selectors';
import { AiPluginService, PrismaService } from '../common/services';
import { EncryptionService } from '../common/services/encryption/encryption.service';
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
    const modelConfig = data.modelConfig ?? undefined;

    const encryptedModelConfig = await this.assertModelConfig(
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
      modelConfigToUpdate = await this.assertModelConfig(
        newModelId,
        oldModelConfig
      );
    } else if (newModelConfig && !newModelId) {
      modelConfigToUpdate = await this.assertModelConfig(
        oldModelId,
        newModelConfig
      );
    } else if (newModelConfig && newModelId) {
      modelConfigToUpdate = await this.assertModelConfig(
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

  private async assertModelConfig(
    fullModelId: string,
    modelConfig?: ConfigValues
  ) {
    const model = this.aiPluginService.getModelOrThrow(fullModelId);

    const classifierInputSchema = model.manifest.classifier?.input;

    if (!classifierInputSchema) {
      if (!modelConfig) {
        return;
      }
      throw new InvalidInput('Model does not support classifier input');
    }

    const validationResult = validateConfigSchema(
      classifierInputSchema,
      modelConfig ?? {}
    );

    if (!validationResult.valid) {
      throw new InvalidInput(validationResult.errors);
    }

    const encryptedModelConfig = this.encryptionService.encryptConfigValues(
      modelConfig ?? {},
      classifierInputSchema
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
    };
  }
}
