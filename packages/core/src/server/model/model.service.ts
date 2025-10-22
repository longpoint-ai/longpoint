import { Injectable } from '@nestjs/common';
import { CommonModelService } from '../common/services';
import { ModelSummaryDto } from './dtos/model-summary.dto';

@Injectable()
export class ModelService {
  constructor(private readonly commonModelService: CommonModelService) {}

  async getModel(id: string) {
    return {};
  }

  async listModels() {
    const models: ModelSummaryDto[] = [];

    for (const manifest of this.commonModelService.listManifests()) {
      const provider = manifest.provider;
      for (const model of provider.models) {
        models.push(
          new ModelSummaryDto({
            ...model,
            provider,
          })
        );
      }
    }

    return models;
  }
}
