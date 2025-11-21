import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export interface TransformParams {
  w?: number;
  h?: number;
  sig?: string;
  expires?: number;
}

@ApiSchema({ name: 'TransformParams' })
export class TransformParamsDto implements TransformParams {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The width of the transformed image in pixels',
    example: 800,
  })
  w?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The height of the transformed image in pixels',
    example: 600,
  })
  h?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The signature for URL verification',
  })
  sig?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The expiration timestamp for the signed URL',
  })
  expires?: number;
}
