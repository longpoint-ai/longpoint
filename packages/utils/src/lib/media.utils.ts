import { SupportedMimeType } from '@longpoint/types';
import { join } from 'path';

type MediaType = 'IMAGE';

/**
 * Parses the mime type into a media type
 * @param mimeType
 * @returns the media type
 */
export function mimeTypeToMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) {
    return 'IMAGE';
  }

  throw new Error(`Unsupported media type: ${mimeType}`);
}

export interface GetMediaContainerPathOptions {
  /**
   * The prefix to add to the path
   * @example
   * ```
   * getMediaContainerPath('123', { prefix: 'public' });
   * // returns 'public/default/123'
   * ```
   */
  prefix?: string;
  /**
   * The suffix to add to the path
   * @example
   * ```
   * getMediaContainerPath('123', { suffix: 'original.mp4' });
   * // returns 'default/123/original.mp4'
   * ```
   */
  suffix?: string;
}

/**
 * Gets the storage path for a media container
 * @param containerId The id of the media container
 * @param options The options for the path
 * @returns
 */
export function getMediaContainerPath(
  containerId: string,
  options?: GetMediaContainerPathOptions
) {
  const { prefix = '', suffix = '' } = options ?? {};
  return join(prefix, 'default', containerId, suffix);
}

/**
 * Converts a mimetype to its corresponding file extension.
 * @param mimeType The content type to convert
 * @returns The file extension
 */
export function mimeTypeToExtension(mimeType: SupportedMimeType) {
  switch (mimeType) {
    case SupportedMimeType.JPEG:
      return 'jpeg';
    case SupportedMimeType.PNG:
      return 'png';
    case SupportedMimeType.GIF:
      return 'gif';
    case SupportedMimeType.JPG:
      return 'jpg';
    case SupportedMimeType.WEBP:
      return 'webp';
    default:
      return 'bin';
  }
}

/**
 * Gets the MIME type for a given file extension or format name.
 * @param extensionOrFormat The file extension (e.g., 'jpg', 'png') or format name (e.g., 'jpeg', 'webp')
 * @returns The MIME type
 */
export function getMimeType(extensionOrFormat: string): string {
  const normalized = extensionOrFormat.toLowerCase();
  switch (normalized) {
    case 'webp':
      return 'image/webp';
    case 'jpeg':
    case 'jpg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Determines content type from file extension.
 * @param filename The filename (e.g., 'image.jpg', 'photo.png')
 * @returns The content type MIME type
 */
export function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return getMimeType(ext);
}
