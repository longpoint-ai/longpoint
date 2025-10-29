import { MediaAssetStatus, MediaAssetVariant } from '@/database';
import { SupportedMimeType } from '@longpoint/types';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { type SelectedMediaAsset } from '../../selectors/media.selectors';
import { ClassifierRunDto } from '../classifier';

export type MediaAssetParams = SelectedMediaAsset & {
  url?: string;
};

@ApiSchema({ name: 'MediaAsset' })
export class MediaAssetDto {
  @ApiProperty({
    description: 'The ID of the media asset',
    example: 'r2qwyd76nvd98cu6ewg8ync2',
  })
  id: string;

  @ApiProperty({
    description: 'The variant of the media asset',
    example: MediaAssetVariant.PRIMARY,
    enum: MediaAssetVariant,
  })
  variant: MediaAssetVariant;

  @ApiProperty({
    description: 'The status of the media asset',
    example: MediaAssetStatus.WAITING_FOR_UPLOAD,
    enum: MediaAssetStatus,
  })
  status: MediaAssetStatus;

  @ApiProperty({
    description: 'The MIME type of the media asset',
    example: SupportedMimeType.JPEG,
    enum: SupportedMimeType,
  })
  mimeType: SupportedMimeType;

  @ApiProperty({
    description: 'The width of the media asset in pixels, if applicable',
    example: 100,
    type: 'number',
    nullable: true,
  })
  width: number | null;

  @ApiProperty({
    description: 'The height of the media asset in pixels, if applicable',
    example: 100,
    type: 'number',
    nullable: true,
  })
  height: number | null;

  @ApiProperty({
    description: 'The size of the media asset in bytes',
    example: 100,
    type: 'number',
    nullable: true,
  })
  size: number | null;

  @ApiProperty({
    description: 'The aspect ratio of the media asset, if applicable',
    example: 1.777777,
    type: 'number',
    nullable: true,
  })
  aspectRatio: number | null;

  @ApiProperty({
    description: 'The URL of the media asset',
    type: 'string',
    example:
      'https://longpoint.example.com/storage/default/abc123/original.jpg',
    nullable: true,
  })
  url: string | null;

  @ApiProperty({
    description: 'The classifier runs for the media asset',
    type: [ClassifierRunDto],
  })
  classifierRuns: ClassifierRunDto[];

  constructor(data: MediaAssetParams) {
    this.id = data.id;
    this.variant = data.variant;
    this.status = data.status;
    this.mimeType = data.mimeType as SupportedMimeType;
    this.width = data.width;
    this.height = data.height;
    this.size = data.size;
    this.aspectRatio = data.aspectRatio;
    this.url = data.url ?? null;
    this.classifierRuns = data.classifierRuns.map(
      (classifierRun) => new ClassifierRunDto(classifierRun)
    );
  }
}
