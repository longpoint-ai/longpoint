export const SdkTag = {
  AI: 'ai',
  Library: 'library',
  Media: 'media',
  Search: 'search',
  Storage: 'storage',
  System: 'system',
} as const;

export type SdkTag = (typeof SdkTag)[keyof typeof SdkTag];
