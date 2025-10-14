import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { LocalStorageProvider } from './storage-providers';
import { StorageProvider } from './storage.types';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  async getDefaultProvider(): Promise<StorageProvider> {
    return new LocalStorageProvider({
      basePath: this.configService.get('storage.localBasePath'),
      baseUrl: this.configService.get('server.baseUrl'),
    });
  }
}
