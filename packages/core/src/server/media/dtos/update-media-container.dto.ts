import { MediaContainerDto } from '@/server/common/dtos/media';
import { ApiSchema, PartialType, PickType } from '@nestjs/swagger';

@ApiSchema({ name: 'UpdateMediaContainer' })
export class UpdateMediaContainerDto extends PartialType(
  PickType(MediaContainerDto, ['name', 'path'] as const)
) {}
