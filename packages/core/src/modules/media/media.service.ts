import { Injectable } from '@nestjs/common';
import { ConfigService, MediaContainerService } from '../common/services';
import { CreateMediaContainerResponseDto } from './dtos/create-media-container-response.dto';
import { CreateMediaContainerDto } from './dtos/create-media-container.dto';
import { DeleteMediaContainerDto } from './dtos/delete-media-container.dto';
import { MediaContainerDto } from './dtos/media-container.dto';
import { UpdateMediaContainerDto } from './dtos/update-media-container.dto';
import { MediaContainerAlreadyExists } from './media.errors';

@Injectable()
export class MediaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mediaContainerService: MediaContainerService
  ) {}

  async createMediaContainer(data: CreateMediaContainerDto) {
    const path = data.path ?? '/';

    const { container, uploadToken } =
      await this.mediaContainerService.createMediaContainer({
        name: data.name,
        path: path,
        mimeType: data.mimeType,
        classifiersOnUpload: data.classifiersOnUpload,
      });

    return new CreateMediaContainerResponseDto({
      id: container.id,
      name: container.name,
      status: container.status,
      path: container.path,
      url: `${this.configService.get('server.baseUrl')}/media/${
        container.id
      }/upload?token=${uploadToken.token}`,
      expiresAt: uploadToken.expiresAt,
    });
  }

  async getMediaContainer(id: string) {
    const container =
      await this.mediaContainerService.getMediaContainerByIdOrThrow(id);
    return new MediaContainerDto(await container.serialize());
  }

  async updateMediaContainer(id: string, data: UpdateMediaContainerDto) {
    const container =
      await this.mediaContainerService.getMediaContainerByIdOrThrow(id);

    const { name: newName, path: newPath } = data;

    if (newName || newPath) {
      const existingContainer =
        await this.mediaContainerService.getMediaContainerByPathName(
          newPath ?? container.path,
          newName ?? container.name
        );

      if (existingContainer) {
        throw new MediaContainerAlreadyExists(
          newName ?? container.name,
          newPath ?? container.path
        );
      }
    }

    await container.update({
      name: newName,
      path: newPath,
    });

    return new MediaContainerDto(await container.serialize());
  }

  async deleteMediaContainer(id: string, data: DeleteMediaContainerDto) {
    const container =
      await this.mediaContainerService.getMediaContainerByIdOrThrow(id);
    await container.delete(data.permanently);
  }
}
