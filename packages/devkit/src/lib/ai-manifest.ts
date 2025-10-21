import { ConfigSchema } from './types.js';

export interface AiManifest {
  provider: AiProviderManifest;
}

export interface AiProviderManifest {
  id: string;
  name?: string;
  config?: ConfigSchema;
  models: AiModelManifest[];
}

export interface AiModelManifest {
  id: string;
  name?: string;
  description?: string;
}
