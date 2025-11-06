export const SdkTag = {
  AI: 'ai',
  Library: 'library',
  Media: 'media',
  Storage: 'storage',
  Tools: 'tools',
} as const;

export type SdkTag = (typeof SdkTag)[keyof typeof SdkTag];
