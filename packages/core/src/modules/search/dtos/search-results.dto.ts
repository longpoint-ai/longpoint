import { MediaContainerSummaryDto } from '@/modules/media/dtos/media-container-summary.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'SearchResults' })
export class SearchResultsDto {
  @ApiProperty({
    description: 'The search results',
    type: [MediaContainerSummaryDto],
  })
  results: MediaContainerSummaryDto[];

  @ApiProperty({
    description: 'Total number of results',
    example: 5,
  })
  total: number;

  constructor(results: MediaContainerSummaryDto[]) {
    this.results = results;
    this.total = results.length;
  }
}
