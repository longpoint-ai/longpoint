import { MediaType } from '@/database';
import {
  ApiExtraModels,
  ApiProperty,
  ApiSchema,
  getSchemaPath,
} from '@nestjs/swagger';
import { TreeItemType } from '../library.types';
import {
  DirectoryTreeItemDto,
  DirectoryTreeItemParams,
} from './directory-tree-item.dto';
import {
  MediaContainerTreeItemDto,
  MediaContainerTreeItemParams,
} from './media-container-tree-item.dto';

export interface LibraryTreeParams {
  path: string;
  items: TreeItemParams[];
}

export type TreeItemDto = MediaContainerTreeItemDto | DirectoryTreeItemDto;
export type TreeItemParams =
  | MediaContainerTreeItemParams
  | DirectoryTreeItemParams;

@ApiSchema({ name: 'LibraryTree' })
@ApiExtraModels(DirectoryTreeItemDto, MediaContainerTreeItemDto)
export class LibraryTreeDto {
  @ApiProperty({
    description: 'The library tree path',
    example: '/skate-tricks/kickflips',
  })
  path: string;

  @ApiProperty({
    description: 'The items in the tree',
    isArray: true,
    discriminator: {
      propertyName: 'treeItemType',
      mapping: {
        [TreeItemType.DIRECTORY]: getSchemaPath(DirectoryTreeItemDto),
        [TreeItemType.MEDIA]: getSchemaPath(MediaContainerTreeItemDto),
      },
    },
    oneOf: [
      { $ref: getSchemaPath(DirectoryTreeItemDto) },
      { $ref: getSchemaPath(MediaContainerTreeItemDto) },
    ],
    example: [
      {
        type: 'DIRECTORY',
        content: {
          path: '/skate-tricks/kickflips/bloopers',
          url: 'https://longpoint.example.com/api/library/tree?path=/skate-tricks/kickflips/bloopers',
        },
      },
      {
        type: 'MEDIA',
        content: {
          id: '123',
          name: 'Stairs',
          type: MediaType.IMAGE,
          status: 'READY',
          createdAt: '2025-10-16T00:00:00.000Z',
        },
      },
      {
        type: 'MEDIA',
        content: {
          id: '123',
          name: 'Long gap',
          type: MediaType.IMAGE,
          status: 'READY',
          createdAt: '2025-10-16T00:00:00.000Z',
        },
      },
    ],
  })
  items: TreeItemDto[];

  constructor(data: LibraryTreeParams) {
    this.path = data.path;
    this.items = data.items.map((item) => this.getItemDto(item));
  }

  private getItemDto(item: TreeItemParams): TreeItemDto {
    if (item.treeItemType === TreeItemType.DIRECTORY) {
      return new DirectoryTreeItemDto(item);
    }
    return new MediaContainerTreeItemDto(item);
  }
}
