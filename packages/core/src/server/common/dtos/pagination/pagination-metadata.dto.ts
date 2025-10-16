import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export interface PaginationMetadataArgs {
  pageSize: number;
  nextCursor: string | null;
  nextLink: string | null;
}

@ApiSchema({ name: 'PaginationMetadata' })
export class PaginationMetadataDto {
  @ApiProperty({
    description: 'The number of items per page',
    example: 100,
  })
  pageSize: number = 100;

  @ApiProperty({
    description: 'The cursor to the next page',
    example: '123',
  })
  nextCursor: string | null = null;

  @ApiProperty({
    description: 'The link to the next page',
    example: 'https://example.com/api/items?cursor=123',
  })
  nextLink: string | null = null;

  constructor(args: PaginationMetadataArgs) {
    this.pageSize = args.pageSize;
    this.nextCursor = args.nextCursor;
    this.nextLink = args.nextLink;
  }
}
