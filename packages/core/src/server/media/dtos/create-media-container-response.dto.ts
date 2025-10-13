import { MediaContainerDto } from '@/server/common/dtos/media';
import { SelectedMediaContainer } from '@/server/common/selectors/media.selectors';
import { ApiProperty, ApiSchema, PickType } from '@nestjs/swagger';
import { addHours } from 'date-fns';

export type CreateMediaContainerResponseParam = Pick<
  SelectedMediaContainer,
  'id' | 'name' | 'status' | 'path'
> & {
  url: string;
  expiresAt: Date;
};

@ApiSchema({ name: 'CreateMediaContainerResponse' })
export class CreateMediaContainerResponseDto extends PickType(
  MediaContainerDto,
  ['id', 'name', 'path', 'status']
) {
  @ApiProperty({
    description: 'The signed URL to upload the asset with.',
    example:
      'https://longpoint.example.com/api/media/abc123/upload?token=abcdefghijklmnopqrst',
  })
  url: string;

  @ApiProperty({
    description: 'The date and time the upload URL expires.',
    example: addHours(new Date(), 1),
  })
  expiresAt: Date;

  constructor(data: CreateMediaContainerResponseParam) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.path = data.path;
    this.status = data.status;
    this.url = data.url;
    this.expiresAt = data.expiresAt;
  }
}
