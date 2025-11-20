import { ConfigSchemaDefinition } from '@longpoint/config-schema';

export interface AiPluginManifest {
  displayName?: string;
  configSchema?: ConfigSchemaDefinition;
  image?: string;
  models: Record<string, AiModelManifest>;
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
