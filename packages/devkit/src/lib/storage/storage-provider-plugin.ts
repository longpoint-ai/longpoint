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
  abstract getFileContents(path: string): Promise<Buffer>;
  abstract exists(path: string): Promise<boolean>;
  abstract deleteDirectory(path: string): Promise<void>;

  get manifest(): T {
    return JSON.parse(JSON.stringify(this._manifest)) as T;
  }
}
