import { IsValidMediaContainerPath } from '@longpoint/validations';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

@ApiSchema({ name: 'GetLibraryTreeQuery' })
export class GetLibraryTreeQueryDto {
  @IsValidMediaContainerPath()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The path to get the tree for',
    example: '/',
    default: '/',
  })
  path: string = '/';
}
