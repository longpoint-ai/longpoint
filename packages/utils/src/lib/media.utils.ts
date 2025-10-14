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
    // case SupportedMimeType.PLAIN_TEXT:
    //   return 'txt';
    // case SupportedMimeType.MP4:
    //   return 'mp4';
    // case SupportedMimeType.WEBM:
    //   return 'webm';
    // case SupportedMimeType.OGV:
    //   return 'ogv';
    // case SupportedMimeType.MOV:
    //   return 'mov';
    // case SupportedMimeType.SVG:
    //   return 'svg';
    // case SupportedMimeType.AAC:
    //   return 'aac';
    // case SupportedMimeType.MP3:
    //   return 'mp3';
    // case SupportedMimeType.WAV:
    //   return 'wav';
    // case SupportedMimeType.OGA:
    //   return 'oga';
    // case SupportedMimeType.WEBA:
    //   return 'weba';
    default:
      return 'bin';
  }
}
