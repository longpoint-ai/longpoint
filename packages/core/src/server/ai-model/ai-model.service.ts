import { Injectable } from '@nestjs/common';
import { ModelSummaryDto } from '../common/dtos/model';
import { AiPluginService } from '../common/services';

@Injectable()
export class AiModelService {
  constructor(private readonly aiPluginService: AiPluginService) {}

  async getModel(id: string) {
    const model = await this.aiPluginService.getModelOrThrow(id);
    return new ModelSummaryDto(model.toJson());
  }

  async listModels() {
    const models = await this.aiPluginService.listModels();

    return models.map((model) => new ModelSummaryDto(model.toJson()));
  }
}
