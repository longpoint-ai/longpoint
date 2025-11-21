import { ConfigService } from '@/modules/common/services';
import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { InvalidSignature } from '../storage.errors';

export interface GenerateSignedUrlOptions {
  w?: number;
  h?: number;
  expiresInSeconds?: number;
}

export interface VerifySignatureQuery {
  sig?: string;
  expires?: number;
  w?: number;
  h?: number;
}

@Injectable()
export class UrlSigningService {
  private readonly defaultExpirationSeconds = 3600; // 1 hour

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generates a signed URL for accessing a file through the storage proxy endpoint.
   * @param containerId The media container ID
   * @param filename The filename within the container
   * @param options Optional parameters for width, height, and expiration
   * @returns A signed URL path with query parameters
   */
  generateSignedUrl(
    containerId: string,
    filename: string,
    options: GenerateSignedUrlOptions = {}
  ): string {
    const { w, h, expiresInSeconds = this.defaultExpirationSeconds } = options;
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

    // Build the string to sign: {containerId}/{filename}?w={w}&h={h}&expires={timestamp}
    const queryParams: string[] = [];
    if (w !== undefined) {
      queryParams.push(`w=${w}`);
    }
    if (h !== undefined) {
      queryParams.push(`h=${h}`);
    }
    queryParams.push(`expires=${expires}`);

    const queryString =
      queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const stringToSign = `${containerId}/${filename}${queryString}`;

    const secret = this.configService.get('storage.storageUrlSecret');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(stringToSign)
      .digest('hex');

    const urlParams = new URLSearchParams();
    urlParams.set('sig', signature);
    urlParams.set('expires', expires.toString());
    if (w !== undefined) {
      urlParams.set('w', w.toString());
    }
    if (h !== undefined) {
      urlParams.set('h', h.toString());
    }

    const finalPath = `/m/${containerId}/${filename}?${urlParams.toString()}`;
    const url = new URL(finalPath, this.configService.get('server.baseUrl'))
      .href;
    return url;
  }

  /**
   * Verifies the signature and expiration of a signed URL.
   * @param path The path part of the URL (e.g., "{containerId}/{filename}")
   * @param query The query parameters including sig, expires, w, h
   * @throws UnauthorizedException if signature is invalid or URL has expired
   */
  verifySignature(path: string, query: VerifySignatureQuery): void {
    const { sig, expires, w, h } = query;

    if (!sig || !expires) {
      throw new InvalidSignature();
    }

    const now = Math.floor(Date.now() / 1000);
    if (expires < now) {
      throw new InvalidSignature();
    }

    // Rebuild the string that should have been signed
    const queryParams: string[] = [];
    if (w !== undefined) {
      queryParams.push(`w=${w}`);
    }
    if (h !== undefined) {
      queryParams.push(`h=${h}`);
    }
    queryParams.push(`expires=${expires}`);

    const queryString =
      queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const stringToSign = `${path}${queryString}`;

    const secret = this.configService.get('storage.storageUrlSecret');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(stringToSign)
      .digest('hex');

    if (
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSignature))
    ) {
      throw new InvalidSignature();
    }
  }
}
