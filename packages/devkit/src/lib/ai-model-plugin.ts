import { Classify, ClassifyArgs } from './ai-capabilities.js';
import { AiModelManifest } from './ai-manifest.js';
import { JsonObject } from './config-schema.js';

export abstract class AiModelPlugin implements Classify {
  constructor(readonly manifest: AiModelManifest) {}

  async classify(args: ClassifyArgs): Promise<JsonObject> {
    throw new Error(`Classify is not implemented for ${this.manifest.id}`);
  }
}
