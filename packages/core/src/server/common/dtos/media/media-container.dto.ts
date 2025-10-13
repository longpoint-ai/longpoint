import { MediaContainerStatus, MediaType } from '@/database';
import { type SelectedMediaContainer } from '@/server/common/selectors/media.selectors';
import {
  IsValidMediaContainerName,
  IsValidMediaContainerPath,
} from '@longpoint/validations';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { createId } from '@paralleldrive/cuid2';

@ApiSchema({ name: 'MediaContainer' })
export class MediaContainerDto {
  @ApiProperty({
    description: 'The ID of the media container',
    example: createId(),
  })
  id: string;

  @IsValidMediaContainerName()
  @ApiProperty({
    description: 'A descriptive name for the underlying media',
    example: 'Blissful Fields',
  })
  name: string;

  @IsValidMediaContainerPath()
  @ApiProperty({
    description: 'The directory path of the media container',
    example: '/',
  })
  path: string;

  @ApiProperty({
    description: 'The primary media type.',
    example: MediaType.IMAGE,
    enum: MediaType,
  })
  type: MediaType;

  @ApiProperty({
    description: 'The status of the media container',
    example: MediaContainerStatus.WAITING_FOR_UPLOAD,
    enum: MediaContainerStatus,
  })
  status: MediaContainerStatus;

  @ApiProperty({
    description: 'When the media container was created',
    example: new Date(),
  })
  createdAt: Date;

  constructor(data: SelectedMediaContainer) {
    this.id = data.id;
    this.name = data.name;
    this.path = data.path;
    this.type = data.type;
    this.status = data.status;
    this.createdAt = data.createdAt;
  }
}
