export const SdkTag = {
  Media: 'media',
  Tools: 'tools',
} as const;

export type SdkTag = (typeof SdkTag)[keyof typeof SdkTag];
