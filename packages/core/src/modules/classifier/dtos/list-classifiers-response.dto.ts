import {
  type PaginationResponseArgs,
  PaginationResponseDto,
} from '@/shared/dtos';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  ClassifierSummaryDto,
  ClassifierSummaryParams,
} from './classifier-summary.dto';

@ApiSchema({ name: 'ListClassifiersResponse' })
export class ListClassifiersResponseDto extends PaginationResponseDto<ClassifierSummaryDto> {
  @ApiProperty({
    description: 'The classifiers in the response',
    type: [ClassifierSummaryDto],
  })
  override items: ClassifierSummaryDto[];

  constructor(args: PaginationResponseArgs<ClassifierSummaryParams>) {
    super(args);
    this.items = args.items.map((item) => new ClassifierSummaryDto(item));
  }
}
