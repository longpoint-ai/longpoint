import {
  ModelSummaryDto,
  ModelSummaryParams,
} from '@/server/common/dtos/model';
import { SelectedClassifier } from '@/server/common/selectors/classifier.selectors';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export interface ClassifierParams extends Omit<SelectedClassifier, 'modelId'> {
  model: ModelSummaryParams;
}

@ApiSchema({ name: 'Classifier' })
export class ClassifierDto {
  @ApiProperty({
    description: 'The ID of the classifier',
    example: 'sajl1kih6emtwozh8y0zenkj',
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'The name of the classifier',
    example: 'General Tagging',
  })
  name: string;

  @ApiProperty({
    description: 'A brief description of the classifier',
    example: 'Tag general subjects like people, places, and things',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description: string | null;

  @ApiProperty({
    description: 'The model used by the classifier',
    type: ModelSummaryDto,
  })
  model: ModelSummaryDto;

  @ApiProperty({
    description: 'When the classifier was created',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the classifier was last updated',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(data: ClassifierParams) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.model = new ModelSummaryDto(data.model);
  }
}
