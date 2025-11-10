import { PluginConfig } from '@longpoint/devkit';
import { manifest } from './manifest.js';
import { OpenAIProvider } from './openai.js';

export default {
  type: 'ai',
  provider: OpenAIProvider,
  manifest,
} satisfies PluginConfig;
