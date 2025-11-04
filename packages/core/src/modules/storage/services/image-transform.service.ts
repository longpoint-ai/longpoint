import { getMimeType } from '@longpoint/utils/media';
import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

export interface TransformOptions {
  width?: number;
  height?: number;
}

export interface TransformResult {
  buffer: Buffer;
  format: string;
  mimeType: string;
}

@Injectable()
export class ImageTransformService {
  /**
   * Transforms an image buffer based on width and height parameters.
   * @param inputBuffer The original image buffer
   * @param options Transform options (width, height)
   * @returns The transformed image buffer and metadata
   */
  async transform(
    inputBuffer: Buffer,
    options: TransformOptions
  ): Promise<TransformResult> {
    const { width, height } = options;
    let sharpInstance = sharp(inputBuffer);

    const metadata = await sharpInstance.metadata();
    const originalFormat = metadata.format;

    const outputFormat = this.getOutputFormat(originalFormat);

    if (width !== undefined && height !== undefined) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'fill', // Fill exact dimensions, may stretch
      });
    } else if (width !== undefined) {
      sharpInstance = sharpInstance.resize(width, undefined, {
        fit: 'inside', // Maintain aspect ratio, fit inside width
      });
    } else if (height !== undefined) {
      sharpInstance = sharpInstance.resize(undefined, height, {
        fit: 'inside', // Maintain aspect ratio, fit inside height
      });
    }

    const buffer = await this.convertToFormat(sharpInstance, outputFormat);
    const mimeType = getMimeType(outputFormat);

    return {
      buffer,
      format: outputFormat,
      mimeType,
    };
  }

  /**
   * Determines the output format, preferring WebP for better compression.
   */
  private getOutputFormat(originalFormat?: string): string {
    return 'webp';
  }

  /**
   * Converts the Sharp instance to the specified format.
   */
  private async convertToFormat(
    sharpInstance: sharp.Sharp,
    format: string
  ): Promise<Buffer> {
    switch (format) {
      case 'webp':
        return sharpInstance.webp().toBuffer();
      case 'jpeg':
      case 'jpg':
        return sharpInstance.jpeg().toBuffer();
      case 'png':
        return sharpInstance.png().toBuffer();
      case 'gif':
        return sharpInstance.webp().toBuffer();
      default:
        return sharpInstance.webp().toBuffer();
    }
  }
}
