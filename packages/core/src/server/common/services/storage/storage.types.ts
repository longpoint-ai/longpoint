import { Readable } from 'stream';

export interface StorageProvider {
  upload(
    containerId: string,
    body: Readable | Buffer | string,
    path: string
  ): Promise<boolean>;
  // getFileContents(path: string): Promise<Buffer>;
  // exists(path: string): Promise<boolean>;
  // deleteFile(path: string): Promise<void>;
  // deleteDirectory(path: string): Promise<void>;
  createSignedUrl(options: CreateSignedUrlOptions): Promise<SignedUrlResponse>;
  // testConnection(): Promise<StorageProviderTestConnectionResult>;
}

export interface SignedUrlResponse {
  /**
   * The signed URL to the asset
   */
  url: string;
  /**
   * The date and time the URL will expire
   */
  expiresAt: Date;
}

export interface CreateSignedUrlOptions {
  /**
   * The ID of the container the asset resides in
   */
  containerId: string;
  /**
   * The relative path to the asset within the container
   */
  path: string;
  /**
   * The action to perform on the asset
   */
  action?: 'read' | 'write';
  /**
   * The number of seconds the URL will be valid for
   */
  expiresInSeconds?: number;
}
