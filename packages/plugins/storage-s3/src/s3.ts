import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  StorageProviderPlugin,
  StorageProviderPluginArgs,
} from '@longpoint/devkit';
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
    const key = this.normalizeS3Key(path);
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
    const key = this.normalizeS3Key(path);

    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.configValues.bucket,
        Key: key,
      })
    );

    if (!response.Body) {
      throw new Error(`Object not found: ${key}`);
    }

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
    const key = this.normalizeS3Key(path);

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
    const prefix = this.normalizeS3Key(path);

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

  /**
   * Normalize a path to an S3 object key.
   * The path parameter should be in format: {prefix}/{storageUnitId}/{containerId}/...
   * We normalize leading slashes and use the full path as the S3 key.
   */
  private normalizeS3Key(path: string): string {
    // Remove leading slashes for S3 key format
    return path.replace(/^\/+/, '');
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
