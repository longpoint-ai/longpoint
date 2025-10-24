import { Classify } from './ai-capabilities.js';
import { AiModelManifest } from './ai-manifest.js';

export abstract class AiModel implements Classify {
  constructor(readonly manifest: AiModelManifest) {}

  async classify(url: string): Promise<object> {
    throw new Error(`Classify is not implemented for ${this.manifest.id}`);
  }
}
