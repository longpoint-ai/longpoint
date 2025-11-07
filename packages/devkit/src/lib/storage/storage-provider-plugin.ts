import { ConfigValues } from '@longpoint/config-schema';
import { Readable } from 'stream';
import { StoragePluginManifest, StorageProvider } from './types.js';

export interface StorageProviderPluginArgs<
  T extends StoragePluginManifest = StoragePluginManifest
> {
  manifest: T;
  configValues: ConfigValues<T['configSchema']>;
  baseUrl: string;
}

export abstract class StorageProviderPlugin<
  T extends StoragePluginManifest = StoragePluginManifest
> implements StorageProvider
{
  readonly id: string;
  readonly name: string;
  private readonly _manifest: T;
  protected readonly configValues: ConfigValues<T['configSchema']>;
  protected readonly baseUrl: string;

  constructor(args: StorageProviderPluginArgs<T>) {
    this.id = args.manifest.id;
    this.name = args.manifest.name ?? this.id;
    this.configValues = args.configValues;
    this.baseUrl = args.baseUrl;
    this._manifest = args.manifest;
  }

  abstract upload(
    path: string,
    body: Readable | Buffer | string
  ): Promise<boolean>;
  abstract getFileStream(path: string): Promise<Readable>;
  abstract exists(path: string): Promise<boolean>;
  abstract deleteDirectory(path: string): Promise<void>;

  /**
   * Helper method to consume the entire stream and return as Buffer.
   * Use this when you need the full file contents in memory.
   */
  async getFileContents(path: string): Promise<Buffer> {
    const stream = await this.getFileStream(path);
    const chunks: Uint8Array[] = [];

    for await (const chunk of stream) {
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

  get manifest(): T {
    return JSON.parse(JSON.stringify(this._manifest)) as T;
  }
}
