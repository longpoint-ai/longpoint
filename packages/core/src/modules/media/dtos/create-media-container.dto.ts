import { SupportedMimeType } from '@longpoint/types';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiSchema,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { MediaContainerDto } from './media-container.dto';

export type CreateMediaContainerParam = Pick<
  MediaContainerDto,
  'name' | 'path'
> & {
  mimeType: SupportedMimeType;
};

@ApiSchema({ name: 'CreateMediaContainer' })
export class CreateMediaContainerDto extends PartialType(
  PickType(MediaContainerDto, ['name', 'path'] as const)
) {
  @IsEnum(SupportedMimeType)
  @ApiProperty({
    description: 'The MIME type of the primary asset',
    example: SupportedMimeType.JPEG,
    enum: SupportedMimeType,
  })
  mimeType!: SupportedMimeType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Names of classifiers to run on the uploaded asset after processing',
    example: ['general-tagging'],
    type: [String],
  })
  classifiersOnUpload?: string[];
}
