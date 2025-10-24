import { Classify, ClassifyArgs } from './ai-capabilities.js';
import { AiModelManifest } from './ai-manifest.js';
import { JsonObject } from './types.js';

export abstract class AiModel implements Classify {
  constructor(readonly manifest: AiModelManifest) {}

  async classify(args: ClassifyArgs): Promise<JsonObject> {
    throw new Error(`Classify is not implemented for ${this.manifest.id}`);
  }
}
