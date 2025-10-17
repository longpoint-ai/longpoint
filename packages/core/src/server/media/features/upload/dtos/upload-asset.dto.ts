import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

@ApiSchema({ name: 'UploadAsset' })
export class UploadAssetQueryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The token used to upload the asset',
    example: 'abcdefghijklmnopqrst',
  })
  token!: string;
}
