export const SdkTag = {
  Media: 'media',
} as const;

export type SdkTag = (typeof SdkTag)[keyof typeof SdkTag];
