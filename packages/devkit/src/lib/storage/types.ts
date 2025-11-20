import { ConfigSchemaDefinition } from '@longpoint/config-schema';
import { Readable } from 'stream';

export interface StorageProvider {
  upload(path: string, body: Readable | Buffer | string): Promise<boolean>;
  getFileStream(path: string): Promise<Readable>;
  getFileContents(path: string): Promise<Buffer>;
  exists(path: string): Promise<boolean>;
  // deleteFile(path: string): Promise<void>;
  // deleteDirectory(path: string): Promise<void>;
  deleteDirectory(path: string): Promise<void>;
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

export interface StoragePluginManifest {
  displayName?: string;
  configSchema?: ConfigSchemaDefinition;
  image?: string;
}
