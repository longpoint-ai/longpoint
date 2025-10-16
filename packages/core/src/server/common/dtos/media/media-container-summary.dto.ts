import { ApiSchema, PickType } from '@nestjs/swagger';
import { type SelectedMediaContainerSummary } from '../../selectors/media.selectors';
import { MediaContainerDto } from './media-container.dto';

export type MediaContainerSummaryParams = SelectedMediaContainerSummary;

@ApiSchema({ name: 'MediaContainerSummary' })
export class MediaContainerSummaryDto extends PickType(MediaContainerDto, [
  'id',
  'name',
  'path',
  'status',
  'createdAt',
] as const) {
  constructor(data: SelectedMediaContainerSummary) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.path = data.path;
    this.status = data.status;
    this.createdAt = data.createdAt;
  }
}
