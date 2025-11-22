import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { TransformParams, TransformParamsDto } from './transform-params.dto';

export interface SignedUrlParams extends TransformParams {
  sig?: string;
  expires?: number;
}

@ApiSchema({ name: 'SignedUrlParams' })
export class SignedUrlParamsDto extends TransformParamsDto {
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
