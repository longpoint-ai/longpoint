import { Injectable } from '@nestjs/common';
import { selectMediaContainerSummary } from '../common/selectors/media.selectors';
import {
  CommonMediaService,
  ConfigService,
  PrismaService,
} from '../common/services';
import {
  DirectoryTreeItemParams,
  GetLibraryTreeQueryDto,
  LibraryTreeDto,
  TreeItemParams,
} from './dtos';
import { PathNotFound } from './library.errors';
import { TreeItemType } from './library.types';

@Injectable()
export class LibraryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly commonMediaService: CommonMediaService
  ) {}

  async getTree(query: GetLibraryTreeQueryDto): Promise<LibraryTreeDto> {
    // Normalize path: ensure leading slash, no trailing slash
    const normalizedPath =
      query.path === '/' ? '/' : `/${query.path.replace(/^\/+|\/+$/g, '')}`;

    // Query containers with path prefix matching
    const containers = await this.prismaService.mediaContainer.findMany({
      where: {
        path: { startsWith: normalizedPath },
        deletedAt: null,
      },
      select: selectMediaContainerSummary(),
    });

    const hydratedContainers = await this.commonMediaService.hydrateContainers(
      containers
    );

    // Extract directories and media items
    const directories = new Map<string, DirectoryTreeItemParams>();
    const mediaItems: TreeItemParams[] = [];

    for (const container of hydratedContainers) {
      if (container.path === normalizedPath) {
        // Container is at exact path - it's a media item
        mediaItems.push({
          treeItemType: TreeItemType.MEDIA,
          ...container,
        });
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
    const directoryItems: TreeItemParams[] = Array.from(directories.values());

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
