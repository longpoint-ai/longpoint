import { Injectable } from '@nestjs/common';
import { MediaContainerDto } from '../common/dtos/media';
import { MediaContainerNotFound } from '../common/errors';
import { selectMediaContainer } from '../common/selectors/media.selectors';
import { PrismaService } from '../common/services';

@Injectable()
export class MediaService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMedia(id: string) {
    const media = await this.prismaService.mediaContainer.findUnique({
      where: {
        id,
      },
      select: selectMediaContainer(),
    });

    if (!media) {
      throw new MediaContainerNotFound(id);
    }

    return new MediaContainerDto(media);
  }
}
