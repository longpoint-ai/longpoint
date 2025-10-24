import {
  getMediaContainerPath,
  mimeTypeToMediaType,
} from '@longpoint/utils/media';
import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { addHours } from 'date-fns';
import { MediaContainerDto } from '../common/dtos/media';
import { MediaContainerNotFound } from '../common/errors';
import { selectMediaContainer } from '../common/selectors/media.selectors';
import {
  CommonMediaService,
  ConfigService,
  PrismaService,
  StorageService,
} from '../common/services';
import { CreateMediaContainerResponseDto } from './dtos/create-media-container-response.dto';
import { CreateMediaContainerDto } from './dtos/create-media-container.dto';
import { DeleteMediaContainerDto } from './dtos/delete-media-container.dto';
import { UpdateMediaContainerDto } from './dtos/update-media-container.dto';
import { PLACEHOLDER_CONTAINER_NAME } from './media.constants';
import { MediaContainerAlreadyExists } from './media.errors';

@Injectable()
export class MediaService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    private readonly commonMediaService: CommonMediaService
  ) {}

  async createMediaContainer(data: CreateMediaContainerDto) {
    const path = data.path ?? '/';
    const { token, expiresAt } = this.generateUploadToken();
    const mediaType = mimeTypeToMediaType(data.mimeType);

    const media = await this.prismaService.mediaContainer.create({
      data: {
        name: await this.getEffectiveName(data.path, data.name),
        path: path,
        type: mediaType,
        status: 'WAITING_FOR_UPLOAD',
        assets: {
          create: {
            variant: 'PRIMARY',
            status: 'WAITING_FOR_UPLOAD',
            mimeType: data.mimeType,
            classifiersOnUpload: data.classifiersOnUpload,
            uploadToken: {
              create: {
                token,
                expiresAt,
              },
            },
          },
        },
      },
      select: selectMediaContainer(),
    });

    return new CreateMediaContainerResponseDto({
      id: media.id,
      name: media.name,
      status: media.status,
      path: media.path,
      url: `${this.configService.get('server.baseUrl')}/media/${
        media.id
      }/upload?token=${token}`,
      expiresAt,
    });
  }

  async getMediaContainer(id: string) {
    const media = await this.prismaService.mediaContainer.findUnique({
      where: {
        id,
      },
      select: selectMediaContainer(),
    });

    if (!media) {
      throw new MediaContainerNotFound(id);
    }

    const [hydrated] = await this.commonMediaService.hydrateContainer(media);

    return new MediaContainerDto(hydrated);
  }

  async updateMediaContainer(id: string, data: UpdateMediaContainerDto) {
    const container = await this.prismaService.mediaContainer.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        path: true,
      },
    });

    if (!container) {
      throw new MediaContainerNotFound(id);
    }

    const { name: newName, path: newPath } = data;

    if (newName || newPath) {
      const existingContainer =
        await this.prismaService.mediaContainer.findUnique({
          where: {
            path_name: {
              path: newPath ?? container.path,
              name: newName ?? container.name,
            },
          },
          select: {
            id: true,
          },
        });

      if (existingContainer && existingContainer.id !== id) {
        throw new MediaContainerAlreadyExists(
          newName ?? container.name,
          newPath ?? container.path
        );
      }
    }

    const updatedContainer = await this.prismaService.mediaContainer.update({
      where: {
        id,
      },
      data: {
        name: newName,
        path: newPath,
      },
      select: selectMediaContainer(),
    });

    const [hydrated] = await this.commonMediaService.hydrateContainer(
      updatedContainer
    );

    return new MediaContainerDto(hydrated);
  }

  async deleteMediaContainer(id: string, data: DeleteMediaContainerDto) {
    const container = await this.prismaService.mediaContainer.findUnique({
      where: {
        id,
      },
    });

    if (!container) {
      throw new MediaContainerNotFound(id);
    }

    if (data.permanently) {
      await this.prismaService.mediaContainer.delete({
        where: {
          id,
        },
      });
      const storageProvider = await this.storageService.getDefaultProvider();
      await storageProvider.deleteDirectory(getMediaContainerPath(id));
    } else {
      await this.prismaService.mediaContainer.update({
        where: {
          id,
        },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
        },
      });
    }
  }

  private generateUploadToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = addHours(new Date(), 1);
    return { token, expiresAt };
  }

  private async getEffectiveName(path = '/', name?: string) {
    if (name) {
      const existingContainer =
        await this.prismaService.mediaContainer.findUnique({
          where: {
            path_name: {
              path,
              name,
            },
          },
        });

      if (existingContainer) {
        throw new MediaContainerAlreadyExists(name, path);
      }

      return name;
    }

    const containers = await this.prismaService.mediaContainer.findMany({
      where: {
        path,
        name: {
          startsWith: PLACEHOLDER_CONTAINER_NAME,
        },
      },
    });

    let counter = 1;
    const MAX_COUNTER = 9999;

    // Check if base name exists, if not use it
    const baseExists = containers.some(
      (container) => container.name === PLACEHOLDER_CONTAINER_NAME
    );

    if (!baseExists) {
      return PLACEHOLDER_CONTAINER_NAME;
    } else {
      // Find the next available sequential name
      while (
        counter <= MAX_COUNTER &&
        containers.some(
          (container) =>
            container.name === `${PLACEHOLDER_CONTAINER_NAME} ${counter}`
        )
      ) {
        counter++;
      }

      if (counter > MAX_COUNTER) {
        throw new Error(
          `Maximum number of placeholder containers (${MAX_COUNTER}) exceeded for path: ${path}`
        );
      }

      return `${PLACEHOLDER_CONTAINER_NAME} ${counter}`;
    }
  }
}
