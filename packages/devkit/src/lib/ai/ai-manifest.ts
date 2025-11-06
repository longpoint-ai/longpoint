import { ConfigSchemaDefinition } from '@longpoint/config-schema';

export interface AiPluginManifest {
  provider: AiProviderManifest;
  models: Record<string, AiModelManifest>;
}

export interface AiProviderManifest {
  id: string;
  name?: string;
  config?: ConfigSchemaDefinition;
  image?: string;
}

export interface AiModelManifest {
  id: string;
  name?: string;
  description?: string;
  supportedMimeTypes?: string[];
  maxFileSize?: string;
  classifier?: {
    input?: ConfigSchemaDefinition;
  };
}
