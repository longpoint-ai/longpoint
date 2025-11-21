import { ApiSchema, PartialType } from '@nestjs/swagger';
import { CreateStorageConfigDto } from './create-storage-config.dto';

@ApiSchema({ name: 'UpdateStorageConfig' })
export class UpdateStorageConfigDto extends PartialType(
  CreateStorageConfigDto
) {}
