import { Module } from '@nestjs/common';
import { StorageUnitService } from './storage-unit.service';

@Module({
  providers: [StorageUnitService],
  exports: [StorageUnitService],
})
export class StorageUnitModule {}
