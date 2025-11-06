import { Module } from '@nestjs/common';
import { StorageProviderController } from './controllers/storage-provider.controller';
import { StorageUnitController } from './controllers/storage-unit.controller';
import { StorageProviderService } from './services/storage-provider.service';
import { StorageUnitService } from './services/storage-unit.service';

@Module({
  controllers: [StorageUnitController, StorageProviderController],
  providers: [StorageUnitService, StorageProviderService],
  exports: [StorageUnitService],
})
export class StorageUnitModule {}
