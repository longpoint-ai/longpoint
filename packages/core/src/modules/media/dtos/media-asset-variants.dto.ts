import { MediaAssetVariant } from '@/database';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { type SelectedMediaContainer } from '../../../shared/selectors/media.selectors';
import { MediaAssetDto } from './media-asset.dto';

export type MediaAssetVariantsParams = SelectedMediaContainer['assets'];

@ApiSchema({ name: 'MediaAssetVariants' })
export class MediaAssetVariantsDto {
  @ApiProperty({
    description: 'The primary media asset',
    type: MediaAssetDto,
  })
  primary: MediaAssetDto;

  constructor(data: MediaAssetVariantsParams) {
    this.primary = this.getPrimaryAsset(data);
  }

  private getPrimaryAsset(data: MediaAssetVariantsParams) {
    const primary = data.find(
      (asset) => asset.variant === MediaAssetVariant.PRIMARY
    );
    if (!primary) {
      throw new Error('Expected primary asset - not found');
    }
    return new MediaAssetDto(primary);
  }
}
