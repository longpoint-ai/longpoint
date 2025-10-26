import { ConfigValues } from '@longpoint/devkit';
import { Injectable } from '@nestjs/common';
import { AiProviderDto } from '../common/dtos/ai-provider';
import { AiPluginService } from '../common/services';

@Injectable()
export class AiProviderService {
  constructor(private readonly aiPluginService: AiPluginService) {}

  async getAiProvider(providerId: string) {
    const provider = await this.aiPluginService.getProviderOrThrow(providerId);
    return new AiProviderDto(provider.toJson());
  }

  async updateAiProviderConfig(providerId: string, config: ConfigValues) {
    const updatedProvider = await this.aiPluginService.updateProviderConfig(
      providerId,
      config
    );
    return new AiProviderDto(updatedProvider.toJson());
  }
}
