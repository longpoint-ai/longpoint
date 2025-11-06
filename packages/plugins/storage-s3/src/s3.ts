import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  CreateSignedUrlOptions,
  SignedUrlResponse,
  StorageProviderPlugin,
  StorageProviderPluginArgs,
} from '@longpoint/devkit';
import { addSeconds } from 'date-fns';
import { Readable } from 'stream';
import { S3StoragePluginManifest } from './manifest.js';

export class S3StorageProvider extends StorageProviderPlugin<S3StoragePluginManifest> {
  private s3Client: S3Client;

  constructor(args: StorageProviderPluginArgs<S3StoragePluginManifest>) {
    super(args);
    this.s3Client = new S3Client({
      region: this.configValues.region,
      credentials: {
        accessKeyId: this.configValues.accessKeyId,
        secretAccessKey: this.configValues.secretAccessKey,
      },
      endpoint: this.configValues.endpoint,
      forcePathStyle: this.configValues.forcePathStyle ?? false,
    });
  }

  async upload(
    path: string,
    body: Readable | Buffer | string
  ): Promise<boolean> {
    const key = this.getS3Key(path);
    const bodyData = await this.bodyToUint8Array(body);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configValues.bucket,
        Key: key,
        Body: bodyData,
      })
    );

    return true;
  }

  async getFileContents(path: string): Promise<Buffer> {
    const key = this.getS3Key(path);

    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.configValues.bucket,
        Key: key,
      })
    );

    if (!response.Body) {
      throw new Error(`Object not found: ${key}`);
    }

    // Convert the stream to a Buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as Readable) {
      chunks.push(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
    }
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return Buffer.from(result);
  }

  async exists(path: string): Promise<boolean> {
    const key = this.getS3Key(path);

    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.configValues.bucket,
          Key: key,
        })
      );
      return true;
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw error;
    }
  }

  async deleteDirectory(path: string): Promise<void> {
    const prefix = this.getS3Key(path);

    // If prefix is empty, we can't safely delete (would delete everything)
    // This shouldn't happen in normal operation, but handle it gracefully
    if (!prefix) {
      return;
    }

    // Ensure prefix ends with / for directory-like behavior
    // S3 doesn't have true directories, but prefix matching works like directories
    const directoryPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;

    const objectsToDelete: { Key: string }[] = [];
    let continuationToken: string | undefined;

    do {
      const listResponse = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.configValues.bucket,
          Prefix: directoryPrefix,
          ContinuationToken: continuationToken,
        })
      );

      if (listResponse.Contents) {
        for (const object of listResponse.Contents) {
          if (object.Key) {
            objectsToDelete.push({ Key: object.Key });
          }
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

    if (objectsToDelete.length === 0) {
      return;
    }

    // S3 allows up to 1000 objects per delete request
    const batchSize = 1000;
    for (let i = 0; i < objectsToDelete.length; i += batchSize) {
      const batch = objectsToDelete.slice(i, i + batchSize);
      await this.s3Client.send(
        new DeleteObjectsCommand({
          Bucket: this.configValues.bucket,
          Delete: {
            Objects: batch,
          },
        })
      );
    }
  }

  async createSignedUrl(
    options: CreateSignedUrlOptions
  ): Promise<SignedUrlResponse> {
    const key = this.getS3Key(options.path);
    const expiresInSeconds = options.expiresInSeconds ?? 3600;

    let command;
    if (options.action === 'write') {
      command = new PutObjectCommand({
        Bucket: this.configValues.bucket,
        Key: key,
      });
    } else {
      // Default to 'read'
      command = new GetObjectCommand({
        Bucket: this.configValues.bucket,
        Key: key,
      });
    }

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    return {
      url,
      expiresAt: addSeconds(new Date(), expiresInSeconds),
    };
  }

  /**
   * Convert a path to an S3 object key.
   * The path parameter should be in format: {storageUnitId}/{containerId}/...
   * We remove the storageUnitId prefix to get the actual object key.
   * Handles edge cases like '/' which becomes empty string.
   */
  private getS3Key(path: string): string {
    // Remove leading slashes and split
    const normalizedPath = path.replace(/^\/+/, '');
    if (!normalizedPath) {
      return '';
    }
    // Remove the first segment (storageUnitId) if path has multiple segments
    const parts = normalizedPath.split('/');
    if (parts.length > 1) {
      return parts.slice(1).join('/');
    }
    // If only one segment or empty, return as-is (this handles edge cases)
    return normalizedPath;
  }

  /**
   * Convert a Readable stream, Buffer, or string to a Uint8Array for S3 uploads.
   */
  private async bodyToUint8Array(
    body: Readable | Buffer | string
  ): Promise<Uint8Array> {
    if (Buffer.isBuffer(body)) {
      return new Uint8Array(body);
    }
    if (typeof body === 'string') {
      return new TextEncoder().encode(body);
    }
    const chunks: Uint8Array[] = [];
    for await (const chunk of body) {
      chunks.push(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
    }
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }
}
