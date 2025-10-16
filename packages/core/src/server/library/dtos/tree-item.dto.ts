import {
  MediaContainerSummaryDto,
  MediaContainerSummaryParams,
} from '@/server/common/dtos/media';
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

export type TreeItemParams =
  | {
      type: typeof TreeItemType.DIRECTORY;
      content: DirectoryTreeItemParams;
    }
  | {
      type: typeof TreeItemType.MEDIA;
      content: MediaContainerSummaryParams;
    };

@ApiSchema({ name: 'TreeItem' })
@ApiExtraModels(DirectoryTreeItemDto, MediaContainerSummaryDto)
export class TreeItemDto {
  @ApiProperty({
    description: 'The tree item type',
    example: TreeItemType.DIRECTORY,
    enum: TreeItemType,
  })
  type: TreeItemType;

  @ApiProperty({
    description: 'The content of the tree item',
    discriminator: {
      propertyName: 'type',
      mapping: {
        [TreeItemType.DIRECTORY]: getSchemaPath(DirectoryTreeItemDto),
        [TreeItemType.MEDIA]: getSchemaPath(MediaContainerSummaryDto),
      },
    },
  })
  content: DirectoryTreeItemDto | MediaContainerSummaryDto;

  constructor(data: TreeItemParams) {
    this.type = data.type;
    this.content = this.getContentDto(data);
  }

  private getContentDto(
    data: TreeItemParams
  ): DirectoryTreeItemDto | MediaContainerSummaryDto {
    if (data.type === TreeItemType.DIRECTORY) {
      return new DirectoryTreeItemDto(data.content);
    }
    return new MediaContainerSummaryDto(data.content);
  }
}
