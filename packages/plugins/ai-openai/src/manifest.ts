import { AiPluginManifest } from '@longpoint/devkit';

export const manifest = {
  provider: {
    id: 'openai',
    name: 'OpenAI',
    image: 'icon.png',
  },
  models: {},
} satisfies AiPluginManifest;

export type OpenAIPluginManifest = typeof manifest;
