import { JsonObject } from '@longpoint/types';
import { Classify, ClassifyArgs } from './ai-capabilities.js';
import { AiModelManifest } from './ai-manifest.js';

export abstract class AiModelPlugin implements Classify {
  constructor(readonly manifest: AiModelManifest) {}

  async classify(args: ClassifyArgs): Promise<JsonObject> {
    throw new Error(`Classify is not implemented for ${this.manifest.id}`);
  }
}
