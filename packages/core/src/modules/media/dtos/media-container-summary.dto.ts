import { ApiSchema, PickType } from '@nestjs/swagger';
import { MediaContainerDto, MediaContainerParams } from './media-container.dto';

export type MediaContainerSummaryParams = Pick<
  MediaContainerParams,
  'id' | 'name' | 'path' | 'status' | 'createdAt' | 'thumbnails'
>;

@ApiSchema({ name: 'MediaContainerSummary' })
export class MediaContainerSummaryDto extends PickType(MediaContainerDto, [
  'id',
  'name',
  'path',
  'status',
  'createdAt',
  'thumbnails',
] as const) {
  constructor(data: MediaContainerSummaryParams) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.path = data.path;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.thumbnails = data.thumbnails;
  }
}
