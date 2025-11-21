import {
  type PaginationResponseArgs,
  PaginationResponseDto,
} from '@/shared/dtos';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  StorageUnitSummaryDto,
  StorageUnitSummaryParams,
} from './storage-unit-summary.dto';

@ApiSchema({ name: 'ListStorageUnitsResponse' })
export class ListStorageUnitsResponseDto extends PaginationResponseDto<StorageUnitSummaryDto> {
  @ApiProperty({
    description: 'The storage units in the response',
    type: [StorageUnitSummaryDto],
  })
  override items: StorageUnitSummaryDto[];

  constructor(args: PaginationResponseArgs<StorageUnitSummaryParams>) {
    super(args);
    this.items = args.items.map((item) => new StorageUnitSummaryDto(item));
  }
}
