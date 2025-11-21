import { Module } from '@nestjs/common';
import { StorageConfigController } from './controllers/storage-config.controller';
import { StorageProviderController } from './controllers/storage-provider.controller';
import { StorageUnitController } from './controllers/storage-unit.controller';
import { StorageProviderConfigService } from './services/storage-provider-config.service';
import { StorageProviderService } from './services/storage-provider.service';
import { StorageUnitService } from './services/storage-unit.service';

@Module({
  controllers: [
    StorageUnitController,
    StorageProviderController,
    StorageConfigController,
  ],
  providers: [
    StorageUnitService,
    StorageProviderService,
    StorageProviderConfigService,
  ],
  exports: [StorageUnitService, StorageProviderConfigService],
})
export class StorageModule {}
