import { PaginationQueryDto } from '@/shared/dtos';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

@ApiSchema({ name: 'ListStorageUnitsQuery' })
export class ListStorageUnitsQueryDto extends PaginationQueryDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The ID of the storage config to filter by',
    example: 'mbjq36xe6397dsi6x9nq4ghc',
  })
  configId?: string;
}
