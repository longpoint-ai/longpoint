import { base64Decode } from '@longpoint/utils/string';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@ApiSchema({ name: 'PaginationQuery' })
export class PaginationQueryDto {
  /**
   * The cursor to the next page.
   */
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? base64Decode(value) : undefined
  )
  @IsString()
  @IsOptional()
  cursor?: string;

  /**
   * The number of items per page.
   * @example 100
   */
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ default: 100 })
  pageSize = 100;

  /**
   * Converts the pagination query into a Prisma cursor pagination object.
   * @param cursorKey - The key to use for the cursor. Defaults to `id`.
   * @returns The Prisma cursor pagination object.
   * @example
   * ```typescript
   * const query = new PaginationQueryDto();
   * const result = await prisma.user.findMany({
   *   ...query.toPrisma(),
   *  where: {
   *    name: {
   *      contains: 'John'
   *    }
   *  }
   * });
   * ```
   */
  toPrisma(cursorKey = 'id') {
    return {
      take: this.pageSize,
      skip: this.cursor ? 1 : 0,
      cursor: this.cursor
        ? ({
            [cursorKey]: this.cursor,
          } as any)
        : undefined,
      orderBy: { [cursorKey]: 'desc' },
    };
  }
}
