import { IsValidMediaContainerPath } from '@longpoint/validations';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

@ApiSchema({ name: 'GetMediaTreeQuery' })
export class GetMediaTreeQueryDto {
  @IsValidMediaContainerPath()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The path to get the tree for',
    example: '/',
    default: '/',
    type: 'string',
  })
  path = '/';
}
