import { ConfigSchema } from './config-schema.js';

export interface AiManifest {
  provider: AiProviderManifest;
}

export interface AiProviderManifest {
  id: string;
  name?: string;
  config?: ConfigSchema;
  image?: string;
  models: AiModelManifest[];
}

export interface AiModelManifest {
  id: string;
  name?: string;
  description?: string;
  supportedMimeTypes: string[];
  maxFileSize?: string;
  classifier?: {
    input?: ConfigSchema;
  };
}
