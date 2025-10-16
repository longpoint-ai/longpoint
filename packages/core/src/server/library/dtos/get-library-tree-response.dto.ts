import { MediaType } from '@/database';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { TreeItemDto, TreeItemParams } from './tree-item.dto';

export interface LibraryTreeParams {
  path: string;
  items: TreeItemParams[];
}

@ApiSchema({ name: 'LibraryTree' })
export class LibraryTreeDto {
  @ApiProperty({
    description: 'The library tree path',
    example: '/skate-tricks/kickflips',
  })
  path: string;

  @ApiProperty({
    description: 'The items in the tree',
    type: [TreeItemDto],
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
    this.items = data.items.map((item) => new TreeItemDto(item));
  }
}
