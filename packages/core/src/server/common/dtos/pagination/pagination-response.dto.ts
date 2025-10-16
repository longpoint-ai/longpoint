import { base64Encode } from '@longpoint/utils/string';
import { PaginationQueryDto } from './pagination-query.dto';

export interface PaginationResponseArgs<D> {
  query: PaginationQueryDto;
  data: D[];
  path: string;
}

export abstract class PaginationResponseDto<T> {
  metadata: {
    /**
     * The number of items per page.
     * @example 10
     */
    pageSize: number;
    /**
     * The cursor to the next page.
     */
    nextCursor: string | null;
    /**
     * The link to the next page.
     */
    nextLink: string | null;
  };

  data: T[];

  constructor(args: PaginationResponseArgs<any>) {
    const { query, data, path } = args;
    const nextCursor = this.nextCursor(query, data);
    let params = Object.entries(query);
    if (nextCursor) {
      // filter out the original cursor and replace it with this new one, if it existed
      params = params.filter(([key]) => key !== 'cursor');
      params.push(['cursor', nextCursor]);
    }
    this.data = data;
    this.metadata = {
      pageSize: query.pageSize,
      nextCursor,
      nextLink: nextCursor ? this.createLink(path, params) : null,
    };
  }

  private nextCursor(
    query: PaginationQueryDto,
    data: any[],
    cursorKey = 'id'
  ): string | null {
    if (data.length === query.pageSize) {
      const lastItem = data[data.length - 1];
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
