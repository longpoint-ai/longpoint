import { ConfigSchema } from './config-schema.js';

export interface AiPluginManifest {
  provider: AiProviderManifest;
  models: Record<string, AiModelManifest>;
}

export interface AiProviderManifest {
  id: string;
  name?: string;
  config?: ConfigSchema;
  image?: string;
}

export interface AiModelManifest {
  id: string;
  name?: string;
  description?: string;
  supportedMimeTypes?: string[];
  maxFileSize?: string;
  classifier?: {
    input?: ConfigSchema;
  };
}
