import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { TreeItem, TreeItemType } from '../library.types';

export interface DirectoryTreeItemParams extends TreeItem {
  treeItemType: typeof TreeItemType.DIRECTORY;
  path: string;
  url: string;
}

@ApiSchema({ name: 'DirectoryTreeItem' })
export class DirectoryTreeItemDto implements TreeItem {
  @ApiProperty({
    description: 'The type of the tree item',
    example: TreeItemType.DIRECTORY,
    enum: [TreeItemType.DIRECTORY],
  })
  treeItemType: typeof TreeItemType.DIRECTORY = TreeItemType.DIRECTORY;

  @ApiProperty({
    description: 'The full path to the directory',
    example: '/skate-tricks/kickflips',
  })
  path: string;

  @ApiProperty({
    description: 'The URL to list the contents of the directory',
    example:
      'https://longpoint.example.com/api/library/tree?path=/skate-tricks/kickflips',
  })
  url: string;

  constructor(data: DirectoryTreeItemParams) {
    this.path = data.path;
    this.url = data.url;
    this.treeItemType = data.treeItemType;
  }
}
