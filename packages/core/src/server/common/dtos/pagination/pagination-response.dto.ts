import { base64Encode } from '@longpoint/utils/string';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetadataDto } from './pagination-metadata.dto';
import { PaginationQueryDto } from './pagination-query.dto';

export interface PaginationResponseArgs<D> {
  query: PaginationQueryDto;
  items: D[];
  path: string;
}

export abstract class PaginationResponseDto<T> {
  items: T[];

  @ApiProperty({
    description: 'The metadata for pagination',
    type: PaginationMetadataDto,
  })
  metadata: PaginationMetadataDto;

  constructor(args: PaginationResponseArgs<any>) {
    const { query, items, path } = args;
    const nextCursor = this.nextCursor(query, items);
    let params = Object.entries(query);
    if (nextCursor) {
      // filter out the original cursor and replace it with this new one, if it existed
      params = params.filter(([key]) => key !== 'cursor');
      params.push(['cursor', nextCursor]);
    }
    this.items = items;
    this.metadata = {
      pageSize: query.pageSize,
      nextCursor,
      nextLink: nextCursor ? this.createLink(path, params) : null,
    };
  }

  private nextCursor(
    query: PaginationQueryDto,
    items: any[],
    cursorKey = 'id'
  ): string | null {
    if (items.length === query.pageSize) {
      const lastItem = items[items.length - 1];
      const cursor = lastItem[cursorKey]?.toString();

      if (cursor) {
        return base64Encode(cursor);
      }
    }
    return null;
  }

  protected createLink(path: string, params: Array<[string, string | number]>) {
    const host = process.env['BASE_URL'] ?? 'http://localhost:3000/api';
    const url = new URL(path, host);
    for (const [key, value] of params) {
      url.searchParams.append(key, value.toString());
    }
    return decodeURIComponent(url.href);
  }
}
