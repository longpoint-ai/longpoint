import { MediaAssetVariant } from '@/database';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { type SelectedMediaContainer } from '../../selectors/media.selectors';
import { MediaAssetDto } from './media-asset.dto';

export type MediaAssetVariantsParams = SelectedMediaContainer['assets'];

@ApiSchema({ name: 'MediaAssetVariants' })
export class MediaAssetVariantsDto {
  @ApiProperty({
    description: 'The original media asset',
    type: MediaAssetDto,
  })
  original: MediaAssetDto;

  constructor(data: MediaAssetVariantsParams) {
    this.original = this.getOriginalAsset(data);
  }

  private getOriginalAsset(data: MediaAssetVariantsParams) {
    const original = data.find(
      (asset) => asset.variant === MediaAssetVariant.ORIGINAL
    );
    if (!original) {
      throw new Error('Expected original asset - not found');
    }
    return new MediaAssetDto(original);
  }
}
