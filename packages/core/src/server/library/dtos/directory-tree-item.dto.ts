import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export interface DirectoryTreeItemParams {
  path: string;
  url: string;
}

@ApiSchema({ name: 'DirectoryTreeItem' })
export class DirectoryTreeItemDto {
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
  }
}
