import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

@ApiSchema({ name: 'SearchQuery' })
export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The search query text',
    example: 'sunset beach',
  })
  query!: string;
}
