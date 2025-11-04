import { MediaAssetVariant, MediaType } from '@/database';
import { ApiSchema, PickType } from '@nestjs/swagger';
import { type SelectedMediaContainerSummary } from '../../selectors/media.selectors';
import { MediaAssetDto } from './media-asset.dto';
import { MediaContainerDto } from './media-container.dto';

export type MediaContainerSummaryParams = SelectedMediaContainerSummary;

@ApiSchema({ name: 'MediaContainerSummary' })
export class MediaContainerSummaryDto extends PickType(MediaContainerDto, [
  'id',
  'name',
  'path',
  'status',
  'createdAt',
  'thumbnails',
] as const) {
  constructor(data: SelectedMediaContainerSummary) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.path = data.path;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.thumbnails = this.getThumbnailAssets(data);
  }

  private getThumbnailAssets(data: SelectedMediaContainerSummary) {
    return data.assets
      .filter(
        (asset) =>
          asset.variant === MediaAssetVariant.THUMBNAIL ||
          (asset.variant === MediaAssetVariant.PRIMARY &&
            data.type === MediaType.IMAGE)
      )
      .map((asset) => new MediaAssetDto(asset));
  }
}
