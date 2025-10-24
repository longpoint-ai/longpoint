import { ConfigValues, JsonObject } from './types.js';

export const AiModelCapability = {
  CLASSIFY: 'CLASSIFY',
} as const;

export type AiModelCapability =
  (typeof AiModelCapability)[keyof typeof AiModelCapability];

export interface ClassifyArgs<T extends ConfigValues = ConfigValues> {
  url: string;
  modelConfig: T;
}

export interface Classify {
  classify(args: ClassifyArgs): Promise<JsonObject>;
}
