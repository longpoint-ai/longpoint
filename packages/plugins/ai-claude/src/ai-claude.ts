import { Anthropic } from '@anthropic-ai/sdk';
import {
  AiModel,
  AiModelManifest,
  AiProvider,
  Classify,
  ConfigValues,
} from '@longpoint/devkit';
import AnthropicManifest from '../ai-manifest.json' with { type: 'json' };

export class AnthropicProvider extends AiProvider<typeof AnthropicManifest> {
  protected override getModelInstance(
    manifest: AiModelManifest,
    modelConfigValues: ConfigValues
  ) {
    const apiKey = this.configValues.apiKey;

    if (!apiKey) {
      throw new Error('API key is required');
    }

    return new ClaudeModel({
      manifest,
      modelConfigValues,
      client: new Anthropic({ apiKey }),
    });
  }
}

export interface ClaudeModelArgs {
  manifest: AiModelManifest;
  modelConfigValues: ConfigValues;
  client: Anthropic;
}

export class ClaudeModel extends AiModel implements Classify {
  protected readonly client: Anthropic;

  constructor(args: ClaudeModelArgs) {
    super(args.manifest);
    this.client = args.client;
  }

  async classify(url: string) {
    return {}
    // await this.client.messages.create({
    //   model: this.id,
    //   max_tokens: this.maxOutputTokens,
    //   messages: [
    //     {
    //       content: [{ type: 'image', source: { url } }],
    //     },
    //   ],
    // });
  }
}
