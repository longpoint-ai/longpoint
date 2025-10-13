import {
  mimeTypeToExtension,
  mimeTypeToMediaType,
} from '@longpoint/utils/media';
import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { addHours } from 'date-fns';
import { MediaContainerDto } from '../common/dtos/media';
import { MediaContainerNotFound } from '../common/errors';
import { selectMediaContainer } from '../common/selectors/media.selectors';
import { ConfigService, PrismaService } from '../common/services';
import { PLACEHOLDER_CONTAINER_NAME } from '../constants/media.constants';
import { CreateMediaContainerResponseDto } from './dtos/create-media-container-response.dto';
import { CreateMediaContainerDto } from './dtos/create-media-container.dto';
import { MediaContainerAlreadyExists } from './media.errors';

@Injectable()
export class MediaService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async createMediaContainer(data: CreateMediaContainerDto) {
    const path = data.path ?? '/';
    const { token, expiresAt } = this.generateUploadToken();

    const media = await this.prismaService.mediaContainer.create({
      data: {
        name: await this.getEffectiveName(data.path, data.name),
        path: path,
        type: mimeTypeToMediaType(data.mimeType),
        status: 'WAITING_FOR_UPLOAD',
        images: {
          create: {
            variant: 'ORIGINAL',
            status: 'WAITING_FOR_UPLOAD',
            extension: mimeTypeToExtension(data.mimeType),
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
      url: `${this.configService.get('baseUrl')}/media/${
        media.id
      }/upload?token=${token}`,
      expiresAt,
    });
  }

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
