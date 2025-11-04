import { Injectable } from '@nestjs/common';
import { ConfigService } from '../common/services';
import { MediaContainerService } from '../media';
import {
  DirectoryTreeItemDto,
  DirectoryTreeItemParams,
  GetLibraryTreeQueryDto,
  LibraryTreeDto,
  TreeItemDto,
} from './dtos';
import { MediaContainerTreeItemDto } from './dtos/media-container-tree-item.dto';
import { PathNotFound } from './library.errors';
import { TreeItemType } from './library.types';

@Injectable()
export class LibraryService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mediaContainerService: MediaContainerService
  ) {}

  async getTree(query: GetLibraryTreeQueryDto): Promise<LibraryTreeDto> {
    const normalizedPath =
      query.path === '/' ? '/' : `/${query.path.replace(/^\/+|\/+$/g, '')}`;
    const containers = await this.mediaContainerService.listContainersByPath(
      normalizedPath
    );
    const hydratedContainers = await Promise.all(
      containers.map((container) => container.toDto())
    );

    // Extract directories and media items
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
          const url = new URL('/library/tree', baseUrl);
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
          const url = new URL('/library/tree', baseUrl);
          url.searchParams.set('path', directoryPath);

          directories.set(directoryPath, {
            path: directoryPath,
            url: url.href,
            treeItemType: TreeItemType.DIRECTORY,
          });
        }
      }
    }

    // Convert directories to tree items
    const directoryItems: TreeItemDto[] = Array.from(directories.values()).map(
      (directory) => new DirectoryTreeItemDto(directory)
    );

    // Combine all items
    const allItems = [...directoryItems, ...mediaItems];

    // If no items found, throw exception
    if (allItems.length === 0) {
      throw new PathNotFound(normalizedPath);
    }

    return new LibraryTreeDto({
      path: normalizedPath,
      items: allItems,
    });
  }
}
