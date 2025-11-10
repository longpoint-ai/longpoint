import {
  AiModelManifest,
  AiModelPlugin,
  AiProviderPlugin,
  ClassifyArgs,
} from '@longpoint/devkit';
import { JsonObject } from '@longpoint/types';
import { OpenAI } from 'openai';
import { zodTextFormat } from 'openai/helpers/zod.mjs';
import { z } from 'zod';
import { OpenAIPluginManifest } from './manifest.js';

export class OpenAIProvider extends AiProviderPlugin<OpenAIPluginManifest> {
  protected override getModelInstance(
    manifest: AiModelManifest
  ): AiModelPlugin {
    const client = new OpenAI({
      apiKey: this.configValues.apiKey,
    });
    return new OpenAIModel({
      manifest,
      client,
    });
  }
}

export interface OpenAiModelArgs {
  manifest: AiModelManifest;
  client: OpenAI;
}

export interface OpenAiModelConfig {
  fieldCapture: Array<{
    name: string;
    instructions?: string;
  }>;
}

class OpenAIModel extends AiModelPlugin {
  protected readonly client: OpenAI;

  constructor(args: OpenAiModelArgs) {
    super(args.manifest);
    this.client = args.client;
  }

  override async classify(args: ClassifyArgs<OpenAiModelConfig>) {
    const mainTypes = [z.string(), z.number(), z.boolean()];
    const schema = z.object(
      args.modelConfig.fieldCapture.reduce((acc, curr) => {
        acc[curr.name] = z.union([...mainTypes, z.array(z.union(mainTypes))]);
        return acc;
      }, {} as Record<string, z.ZodType>)
    );

    const systemPrompt = `
      You are a classifier.
      You will be given an image and a list of fields to capture.
      You will need to capture the fields from the image, based on each field's instructions.
      Some fields will have no particular instructions, in which case use your best judgment to capture the field.
      e.g. For the field "type", with instructions "Choose the type of fruit", the response might be: {"type": "apple"}
    `;

    const response = await this.client.responses.parse({
      model: this.manifest.id,
      instructions: systemPrompt,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_image',
              detail: 'auto',
              image_url: args.source.base64DataUri ?? args.source.url,
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(schema, 'classifier_output'),
      },
    });

    return (response.output_parsed as JsonObject) ?? {};
  }
}
