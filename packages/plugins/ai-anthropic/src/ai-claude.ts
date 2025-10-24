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

export interface ClaudeModelConfig {
  fieldCapture: Array<{
    name: string;
    instructions?: string;
  }>
}

export class ClaudeModel extends AiModel {
  protected readonly client: Anthropic;

  constructor(args: ClaudeModelArgs) {
    super(args.manifest);
    this.client = args.client;
  }

  override async classify(args: ClassifyArgs<ClaudeModelConfig>) {
    const systemPrompt = `
      You are a classifier.
      You will be given an image and a list of fields to capture.
      You will need to capture the fields from the image, based on each field's instructions.
      Some fields will have no particular instructions, in which case use your best judgment to capture the field.
      You will need to return the fields as a raw JSON string with no formatting, including no code block syntax, no markdown, no html, no anything else.
      e.g. For the field "type", with instructions "Choose the type of fruit", the response should be: {"type": "apple"}
      The fields to capture, along with their instructions, are:
      ${args.modelConfig.fieldCapture.map(field => `- ${field.name}${field.instructions ? `: ${field.instructions}` : ''}`).join('\n')}
    `;

    const result = await this.client.messages.create({
      model: this.manifest.id,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: await this.getSource(args.url)
            }
          ]
        }
      ],
    });

    const fullOutput = result.content.reduce((acc, curr) => {
      if (curr.type === 'text') {
        acc += curr.text;
      }
      return acc;
    }, '')
    console.log(fullOutput);

    return JSON.parse(fullOutput);
  }

  private async getSource(urlString: string): Promise<Anthropic.ImageBlockParam['source']> {
    const url = new URL(urlString);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      console.log(urlString);
      const imageData = await fetch(urlString);
      const imageBuffer = await imageData.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');
      const media_type = imageData.headers.get('content-type') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
      return {
        type: 'base64',
        data: base64,
        media_type,
      }
    }
    return {
      type: 'url',
      url: urlString,
    }
  }
}
