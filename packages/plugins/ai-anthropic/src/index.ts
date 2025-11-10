import { PluginConfig } from '@longpoint/devkit';
import { AnthropicProvider } from './ai-claude.js';
import { manifest } from './manifest.js';

export default {
  type: 'ai',
  provider: AnthropicProvider,
  manifest,
} satisfies PluginConfig;
