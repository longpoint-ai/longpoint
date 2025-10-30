export const SdkTag = {
  AI: 'ai',
  Library: 'library',
  Media: 'media',
  Tools: 'tools',
} as const;

export type SdkTag = (typeof SdkTag)[keyof typeof SdkTag];
