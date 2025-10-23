import { AiModelManifest } from './ai-manifest.js';

export abstract class AiModel {
  constructor(readonly manifest: AiModelManifest) {}

  async classify(url: string): Promise<object> {
    throw new Error(`Classify is not implemented for ${this.manifest.id}`);
  }
}
