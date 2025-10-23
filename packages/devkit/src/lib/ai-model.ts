import { AiModelCapability } from './ai-capabilities.js';
import { AiModelManifest } from './ai-manifest.js';

export abstract class AiModel {
  readonly id: string;
  readonly name: string;
  readonly description?: string;

  constructor(manifest: AiModelManifest) {
    this.id = manifest.id;
    this.name = manifest.name ?? this.id;
    this.description = manifest.description;
  }

  async classify(url: string): Promise<object> {
    throw new Error(`Classify is not implemented for ${this.id}`);
  }

  get capabilities() {
    const capabilities: AiModelCapability[] = [];

    if (Object.prototype.hasOwnProperty.call(this, 'classify')) {
      capabilities.push(AiModelCapability.CLASSIFY);
    }

    return capabilities;
  }
}
