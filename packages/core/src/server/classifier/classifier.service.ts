import { ConfigValues } from '@longpoint/devkit';
import { validateConfigSchema } from '@longpoint/validations';
import { Injectable } from '@nestjs/common';
import { InvalidInput } from '../common/errors';
import {
  selectClassifier,
  SelectedClassifier,
} from '../common/selectors/classifier.selectors';
import { CommonModelService, PrismaService } from '../common/services';
import { ClassifierDto, ClassifierParams } from './dtos/classifier.dto';
import { CreateClassifierDto } from './dtos/create-classifier.dto';
import { UpdateClassifierDto } from './dtos/update-classifier.dto';

@Injectable()
export class ClassifierService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly commonModelService: CommonModelService
  ) {}

  async createClassifier(data: CreateClassifierDto) {
    const isValidModelConfig = await this.isValidModelConfig(
      data.modelId,
      data.modelConfig
    );

    if (!isValidModelConfig) {
      throw new InvalidInput('Invalid model configuration');
    }

    const classifier = await this.prismaService.classifier.create({
      data: {
        name: data.name,
        description: data.description,
        modelId: data.modelId,
        modelConfig: data.modelConfig,
      },
      select: selectClassifier(),
    });

    const hydrated = await this.hydrateClassifier(classifier);

    return new ClassifierDto(hydrated);
  }

  async updateClassifier(id: string, data: UpdateClassifierDto) {}

  private async isValidModelConfig(
    modelId: string,
    modelConfig: ConfigValues
  ): Promise<boolean> {
    try {
      // Parse modelId to extract providerId and modelId
      const [providerId, actualModelId] = modelId.split('/');
      if (!providerId || !actualModelId) {
        return false;
      }

      // Get the provider registry to access the manifest
      const manifests = this.commonModelService.listManifests();
      const providerManifest = manifests.find(
        (m) => m.provider.id === providerId
      );

      if (!providerManifest) {
        return false;
      }

      // Find the specific model in the provider's models
      const modelManifest = providerManifest.provider.models.find(
        (m) => m.id === actualModelId
      );

      if (!modelManifest || !modelManifest.classifier?.input) {
        return false;
      }

      // Validate the modelConfig against the classifier input schema
      const validationResult = validateConfigSchema(
        modelManifest.classifier.input,
        modelConfig
      );

      if (!validationResult.valid) {
        // Log detailed validation errors for debugging
        console.error(
          'Model config validation failed:',
          validationResult.errors
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating model config:', error);
      return false;
    }
  }

  private async hydrateClassifier(
    classifier: SelectedClassifier
  ): Promise<ClassifierParams> {
    return {
      ...classifier,
      model: await this.commonModelService.getModelJson(classifier.modelId),
    };
  }
}
