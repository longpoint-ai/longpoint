import { SupportedMimeType } from '@longpoint/types';

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
