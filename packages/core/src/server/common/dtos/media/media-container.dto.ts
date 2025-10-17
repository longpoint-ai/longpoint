import {
  MediaAssetStatus,
  MediaAssetVariant,
  MediaContainerStatus,
  MediaType,
} from '@/database';
import { type SelectedMediaContainer } from '@/server/common/selectors/media.selectors';
import { SupportedMimeType } from '@longpoint/types';
import {
  IsValidMediaContainerName,
  IsValidMediaContainerPath,
} from '@longpoint/validations';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { createId } from '@paralleldrive/cuid2';
import { MediaAssetVariantsDto } from './media-asset-variants.dto';

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

  @ApiProperty({
    description: 'The accessible media assets in the container',
    type: MediaAssetVariantsDto,
    example: {
      original: {
        id: createId(),
        variant: MediaAssetVariant.ORIGINAL,
        status: MediaAssetStatus.READY,
        mimeType: SupportedMimeType.JPEG,
        width: 1920,
        height: 1080,
        size: 950120,
        aspectRatio: 1.777777,
        url: 'https://longpoint.example.com/storage/default/abc123/original.jpg',
      },
    },
  })
  assets: MediaAssetVariantsDto;

  constructor(data: SelectedMediaContainer) {
    this.id = data.id;
    this.name = data.name;
    this.path = data.path;
    this.type = data.type;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.assets = new MediaAssetVariantsDto(data.assets);
  }
}
