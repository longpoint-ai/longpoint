import { Anthropic } from '@anthropic-ai/sdk';
import {
  AiModel,
  AiModelManifest,
  AiProvider,
  ClassifyArgs
} from '@longpoint/devkit';
import AnthropicManifest from '../ai-manifest.json' with { type: 'json' };

export class AnthropicProvider extends AiProvider<typeof AnthropicManifest> {
  protected override getModelInstance(manifest: AiModelManifest) {
    const apiKey = this.configValues.apiKey;

    if (!apiKey) {
      throw new Error('API key is required');
    }

    return new ClaudeModel({
      manifest,
      client: new Anthropic({ apiKey }),
    });
  }
}

export interface ClaudeModelArgs {
  manifest: AiModelManifest;
  client: Anthropic;
}

export class ClaudeModel extends AiModel {
  protected readonly client: Anthropic;

  constructor(args: ClaudeModelArgs) {
    super(args.manifest);
    this.client = args.client;
  }

  override async classify(args: ClassifyArgs) {
    return {
      "theseweretheconfigvalues": args.modelConfig ?? null,
    }
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
