import { ApiSchema, PartialType } from '@nestjs/swagger';
import { CreateStorageUnitDto } from './create-storage-unit.dto';

@ApiSchema({ name: 'UpdateStorageUnit' })
export class UpdateStorageUnitDto extends PartialType(CreateStorageUnitDto) {}
