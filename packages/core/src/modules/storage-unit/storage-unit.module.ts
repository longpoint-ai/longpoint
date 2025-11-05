import { Module } from '@nestjs/common';
import { StorageUnitController } from './storage-unit.controller';
import { StorageUnitService } from './storage-unit.service';

@Module({
  controllers: [StorageUnitController],
  providers: [StorageUnitService],
  exports: [StorageUnitService],
})
export class StorageUnitModule {}
