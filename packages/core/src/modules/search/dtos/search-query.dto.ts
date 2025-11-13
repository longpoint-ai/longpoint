import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

@ApiSchema({ name: 'SearchQuery' })
export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The search query text',
    example: 'sunset beach',
  })
  query!: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
  })
  limit?: number;
}
