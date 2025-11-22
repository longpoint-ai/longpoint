import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../common/services';
import {
  DirectoryTreeItemDto,
  DirectoryTreeItemParams,
  GetMediaTreeQueryDto,
  MediaContainerTreeItemDto,
  MediaTreeDto,
  TreeItemDto,
} from '../dtos';
import { TreePathNotFound } from '../media.errors';
import { TreeItemType } from '../media.types';
import { MediaContainerService } from './media-container.service';

@Injectable()
export class MediaTreeService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mediaContainerService: MediaContainerService
  ) {}

  async getTree(query: GetMediaTreeQueryDto): Promise<MediaTreeDto> {
    const normalizedPath =
      query.path === '/' ? '/' : `/${query.path.replace(/^\/+|\/+$/g, '')}`;
    const containers = await this.mediaContainerService.listContainersByPath(
      normalizedPath
    );
    const hydratedContainers = await Promise.all(
      containers.map((container) => container.toDto())
    );

    const directories = new Map<string, DirectoryTreeItemParams>();
    const mediaItems: TreeItemDto[] = [];

    for (const container of hydratedContainers) {
      if (container.path === normalizedPath) {
        // Container is at exact path - it's a media item
        mediaItems.push(new MediaContainerTreeItemDto(container));
      } else if (container.path.startsWith(normalizedPath + '/')) {
        // Container is in a subdirectory - extract the directory name
        const relativePath = container.path.substring(
          normalizedPath.length + 1
        );
        const firstSlashIndex = relativePath.indexOf('/');
        const directoryName =
          firstSlashIndex === -1
            ? relativePath
            : relativePath.substring(0, firstSlashIndex);
        const directoryPath = `${normalizedPath}/${directoryName}`;

        if (!directories.has(directoryPath)) {
          const baseUrl = this.configService.get('server.baseUrl');
          const url = new URL('/media/tree', baseUrl);
          url.searchParams.set('path', directoryPath);

          directories.set(directoryPath, {
            path: directoryPath,
            url: url.href,
            treeItemType: TreeItemType.DIRECTORY,
          });
        }
      } else if (normalizedPath === '/' && container.path !== '/') {
        // Special case: when listing root path, also discover directories from containers at deeper levels
        // Extract the first directory segment from containers like "/cheese/please"
        const pathWithoutLeadingSlash = container.path.substring(1);
        const firstSlashIndex = pathWithoutLeadingSlash.indexOf('/');
        const directoryName =
          firstSlashIndex === -1
            ? pathWithoutLeadingSlash
            : pathWithoutLeadingSlash.substring(0, firstSlashIndex);
        const directoryPath = `/${directoryName}`;

        if (!directories.has(directoryPath)) {
          const baseUrl = this.configService.get('server.baseUrl');
          const url = new URL('/media/tree', baseUrl);
          url.searchParams.set('path', directoryPath);

          directories.set(directoryPath, {
            path: directoryPath,
            url: url.href,
            treeItemType: TreeItemType.DIRECTORY,
          });
        }
      }
    }

    const directoryItems: TreeItemDto[] = Array.from(directories.values()).map(
      (directory) => new DirectoryTreeItemDto(directory)
    );

    const allItems = [...directoryItems, ...mediaItems];

    // Root path can be empty (no containers yet), which is a valid state
    if (allItems.length === 0 && normalizedPath !== '/') {
      throw new TreePathNotFound(normalizedPath);
    }

    return new MediaTreeDto({
      path: normalizedPath,
      items: allItems,
    });
  }
}
