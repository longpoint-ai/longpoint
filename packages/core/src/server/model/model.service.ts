import { Injectable } from '@nestjs/common';
import { ModelSummaryDto } from '../common/dtos/model';
import { CommonModelService, PrismaService } from '../common/services';

@Injectable()
export class ModelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly commonModelService: CommonModelService
  ) {}

  async getModel(id: string) {
    const model = await this.commonModelService.getModel(id);
    return {};
  }

  async listModels() {
    const models: ModelSummaryDto[] = [];
    const manifests = this.commonModelService.listManifests();
    const providerConfigs = await this.prismaService.aiProviderConfig.findMany({
      where: {
        providerId: {
          in: manifests.map((m) => m.provider.id),
        },
      },
    });

    for (const { provider } of manifests) {
      const providerConfig = providerConfigs.find(
        (c) => c.providerId === provider.id
      )?.config as Record<string, any> | undefined;
      const needsConfig = this.commonModelService.providerNeedsConfig(
        provider.id,
        providerConfig
      );
      for (const model of provider.models) {
        models.push(
          new ModelSummaryDto({
            ...model,
            provider: {
              ...provider,
              needsConfig,
            },
          })
        );
      }
    }

    return models;
  }
}
