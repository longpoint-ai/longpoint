import { MediaType } from '@/database';
import {
  PaginationResponseArgs,
  PaginationResponseDto,
} from '@/server/common/dtos/pagination';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { TreeItemDto, TreeItemParams } from './tree-item.dto';

export interface GetLibraryTreeResponseArgs
  extends PaginationResponseArgs<TreeItemParams> {
  treePath: string;
}

@ApiSchema({ name: 'GetLibraryTreeResponse' })
export class GetLibraryTreeResponseDto extends PaginationResponseDto<TreeItemDto> {
  @ApiProperty({
    description: 'The path in the library tree',
    example: '/skate-tricks/kickflips',
  })
  path: string;

  @ApiProperty({
    description: 'The items in the tree path',
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
  override items: TreeItemDto[];

  constructor(args: GetLibraryTreeResponseArgs) {
    super(args);
    this.path = args.treePath;
    this.items = args.items.map((item) => new TreeItemDto(item));
  }
}
