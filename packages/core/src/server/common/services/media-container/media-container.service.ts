import { PLACEHOLDER_CONTAINER_NAME } from '@/server/media/media.constants';
import { MediaContainerAlreadyExists } from '@/server/media/media.errors';
import { mimeTypeToMediaType } from '@longpoint/utils/media';
import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { addHours } from 'date-fns';
import { MediaContainerEntity } from '../../entities';
import { MediaContainerNotFound } from '../../errors';
import {
  selectMediaContainer,
  selectMediaContainerSummary,
} from '../../selectors/media.selectors';
import { PrismaService } from '../prisma/prisma.service';
import { StorageUnitService } from '../storage-unit/storage-unit.service';
import { CreateMediaContainerParams } from './media-container-service.types';

/**
 * Service for managing media containers and their associated assets.
 * Handles creation, retrieval, and listing of media containers with support
 * for upload tokens, storage units, and automatic naming.
 */
@Injectable()
export class MediaContainerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageUnitService: StorageUnitService
  ) {}

  /**
   * Creates a new media container with an associated primary asset and upload token.
   *
   * The container is created in a WAITING_FOR_UPLOAD status initially.
   * An upload token is automatically generated that expires in 1 hour from creation.
   *
   * @param data - Parameters for creating the media container
   * @param data.path - The path where the container should be created
   * @param data.name - Optional name for the container. If not provided, a placeholder name will be generated
   * @param data.mimeType - The MIME type of the media file
   * @param data.classifiersOnUpload - Optional array of classifier IDs to run on upload
   *
   * @returns An object containing:
   *   - uploadToken: The generated upload token with expiration date
   *   - container: The created MediaContainerEntity instance
   *
   * @throws {MediaContainerAlreadyExists} If a container with the same path and name already exists
   */
  async createMediaContainer(data: CreateMediaContainerParams) {
    const uploadToken = this.generateUploadToken();
    const mediaType = mimeTypeToMediaType(data.mimeType);
    const defaultStorageUnit =
      await this.storageUnitService.getOrCreateDefaultStorageUnit();

    const container = await this.prismaService.mediaContainer.create({
      data: {
        name: await this.getEffectiveName(data.path, data.name),
        path: data.path,
        type: mediaType,
        status: 'WAITING_FOR_UPLOAD',
        storageUnitId: defaultStorageUnit.id,
        assets: {
          create: {
            variant: 'PRIMARY',
            status: 'WAITING_FOR_UPLOAD',
            mimeType: data.mimeType,
            classifiersOnUpload: data.classifiersOnUpload,
            uploadToken: {
              create: {
                token: uploadToken.token,
                expiresAt: uploadToken.expiresAt,
              },
            },
          },
        },
      },
      select: selectMediaContainer(),
    });

    return {
      uploadToken,
      container: new MediaContainerEntity({
        ...container,
        storageUnit: defaultStorageUnit,
        prismaService: this.prismaService,
      }),
    };
  }

  /**
   * Retrieves a media container by its unique identifier.
   *
   * @param id - The unique identifier of the media container
   *
   * @returns The MediaContainerEntity instance
   *
   * @throws {MediaContainerNotFound} If the container does not exist
   */
  async getMediaContainerById(
    id: string
  ): Promise<MediaContainerEntity | null> {
    const container = await this.prismaService.mediaContainer.findUnique({
      where: { id },
      select: selectMediaContainer(),
    });

    if (!container) {
      throw new MediaContainerNotFound(id);
    }

    return new MediaContainerEntity({
      ...container,
      storageUnit: await this.storageUnitService.getStorageUnitByContainerId(
        id
      ),
      prismaService: this.prismaService,
    });
  }

  /**
   * Retrieves a media container by its unique identifier, throwing an error if not found.
   *
   * This is a convenience method that ensures a non-null result. It wraps
   * getMediaContainerById and throws if the result is null.
   *
   * @param id - The unique identifier of the media container
   *
   * @returns The MediaContainerEntity instance (guaranteed to be non-null)
   *
   * @throws {MediaContainerNotFound} If the container does not exist
   */
  async getMediaContainerByIdOrThrow(
    id: string
  ): Promise<MediaContainerEntity> {
    const container = await this.getMediaContainerById(id);
    if (!container) {
      throw new MediaContainerNotFound(id);
    }
    return container;
  }

  /**
   * Retrieves a media container by its path and name combination.
   *
   * The path and name together form a unique identifier for containers.
   *
   * @param path - The path of the container
   * @param name - The name of the container
   *
   * @returns The MediaContainerEntity if found, or null if not found
   */
  async getMediaContainerByPathName(
    path: string,
    name: string
  ): Promise<MediaContainerEntity | null> {
    const container = await this.prismaService.mediaContainer.findUnique({
      where: {
        path_name: { path, name },
      },
      select: selectMediaContainer(),
    });

    if (!container) {
      return null;
    }

    return new MediaContainerEntity({
      ...container,
      storageUnit: await this.storageUnitService.getStorageUnitByContainerId(
        container.id
      ),
      prismaService: this.prismaService,
    });
  }

  /**
   * Lists all media containers that are located at or under the specified path.
   *
   * Only returns containers that have not been deleted (deletedAt is null).
   * Uses a prefix match, so containers in subdirectories are included.
   *
   * @param path - The path prefix to search for containers
   *
   * @returns An array of MediaContainerEntity instances matching the path
   */
  async listContainersByPath(path: string): Promise<MediaContainerEntity[]> {
    const containers = await this.prismaService.mediaContainer.findMany({
      where: {
        path: { startsWith: path },
        deletedAt: null,
      },
      select: selectMediaContainerSummary(),
    });

    const entities = await Promise.all(
      containers.map(
        async (container) =>
          new MediaContainerEntity({
            ...container,
            storageUnit:
              await this.storageUnitService.getStorageUnitByContainerId(
                container.id
              ),
            prismaService: this.prismaService,
          })
      )
    );

    return entities;
  }

  /**
   * Determines the effective name to use for a media container.
   *
   * If a name is provided, it checks for conflicts and throws if a container
   * with the same path and name already exists. If no name is provided,
   * generates a placeholder name by finding the next available sequential
   * placeholder name (e.g., "placeholder", "placeholder 1", "placeholder 2", etc.).
   *
   * @param path - The path where the container will be created (defaults to '/')
   * @param name - Optional explicit name for the container
   *
   * @returns The effective name to use for the container
   *
   * @throws {MediaContainerAlreadyExists} If a name is provided and conflicts with an existing container
   * @throws {Error} If the maximum number of placeholder containers (9999) is exceeded
   */
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

  /**
   * Generates a secure upload token with a 1-hour expiration.
   *
   * The token is a cryptographically secure random 32-byte hex string.
   * The expiration time is set to 1 hour from the current time.
   *
   * @returns An object containing:
   *   - token: A random hex string (64 characters)
   *   - expiresAt: The expiration date/time (1 hour from now)
   */
  private generateUploadToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = addHours(new Date(), 1);
    return { token, expiresAt };
  }
}
