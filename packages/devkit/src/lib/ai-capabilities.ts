export const AiModelCapability = {
  CLASSIFY: 'CLASSIFY',
} as const;

export type AiModelCapability =
  (typeof AiModelCapability)[keyof typeof AiModelCapability];

export interface Classify {
  classify(url: string): Promise<object>;
}
