import { Injectable } from '@nestjs/common';
import { AiModelDto } from '../common/dtos/model';
import { AiModelSummaryDto } from '../common/dtos/model/ai-model-summary.dto';
import { AiPluginService } from '../common/services';

@Injectable()
export class AiModelService {
  constructor(private readonly aiPluginService: AiPluginService) {}

  async getModel(id: string) {
    const model = await this.aiPluginService.getModelOrThrow(id);
    return new AiModelDto(model.toJson());
  }

  async listModels() {
    const models = await this.aiPluginService.listModels();

    return models.map((model) => new AiModelSummaryDto(model.toJson()));
  }
}
