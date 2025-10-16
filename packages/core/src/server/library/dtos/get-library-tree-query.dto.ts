import { PaginationQueryDto } from '@/server/common/dtos/pagination';
import { IsValidMediaContainerPath } from '@longpoint/validations';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

@ApiSchema({ name: 'GetLibraryTreeQuery' })
export class GetLibraryTreeQueryDto extends PaginationQueryDto {
  @IsValidMediaContainerPath()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The path to get the tree for',
    example: 'skate-tricks/kickflips',
    default: '/',
  })
  path: string = '/';
}
