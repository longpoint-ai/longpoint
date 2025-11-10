import {
  AiModelManifest,
  AiModelPlugin,
  AiProviderPlugin,
} from '@longpoint/devkit';
import { OpenAIPluginManifest } from './manifest.js';

export class OpenAIProvider extends AiProviderPlugin<OpenAIPluginManifest> {
  protected override getModelInstance(
    manifest: AiModelManifest
  ): AiModelPlugin {
    throw new Error('Method not implemented.');
  }
}
