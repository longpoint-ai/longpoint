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
import { MediaAssetVariantsDto } from './media-asset-variants.dto';
import { MediaAssetDto, MediaAssetParams } from './media-asset.dto';

export type MediaContainerParams = Omit<SelectedMediaContainer, 'assets'> & {
  assets: MediaAssetParams[];
};

@ApiSchema({ name: 'MediaContainer' })
export class MediaContainerDto {
  @ApiProperty({
    description: 'The ID of the media container',
    example: 'r2qwyd76nvd98cu6ewg8ync2',
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
      primary: {
        id: 'okie3r17vhfswyyp38v9lrsl',
        variant: MediaAssetVariant.PRIMARY,
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
  variants: MediaAssetVariantsDto;

  @ApiProperty({
    description: 'Thumbnails for the media container',
    type: () => MediaAssetDto,
    isArray: true,
  })
  thumbnails: MediaAssetDto[];

  constructor(data: MediaContainerParams) {
    this.id = data.id;
    this.name = data.name;
    this.path = data.path;
    this.type = data.type;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.variants = new MediaAssetVariantsDto(data.assets);
    this.thumbnails = this.getThumbnailAssets(data);
  }

  private getThumbnailAssets(data: MediaContainerParams) {
    return data.assets
      .filter((asset) => asset.variant === MediaAssetVariant.THUMBNAIL)
      .map((asset) => new MediaAssetDto(asset));
  }
}
