export const SupportedMimeType = {
  JPG: 'image/jpg',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  // SVG: 'image/svg+xml',
  // MP4: 'video/mp4',
  // WEBM: 'video/webm',
  // MOV: 'video/quicktime',
  // OGV: 'video/ogg',
  // PLAIN_TEXT: 'text/plain',
  // HTML: 'text/html',
  // MP3: 'audio/mpeg',
  // WAV: 'audio/wav',
  // OGA: 'audio/ogg',
  // AAC: 'audio/aac',
  // WEBA: 'audio/webm',
} as const;

export type SupportedMimeType =
  (typeof SupportedMimeType)[keyof typeof SupportedMimeType];
