import { ApiProperty, ApiSchema, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ClassifierDto } from './classifier.dto';

@ApiSchema({ name: 'CreateClassifier' })
export class CreateClassifierDto extends PickType(ClassifierDto, [
  'name',
  'description',
  'modelConfig',
] as const) {
  @IsString()
  @ApiProperty({
    description: 'The ID of the model to use for the classifier',
    example: 'anthropic/claude-haiku-4-5-20251001',
  })
  modelId!: string;
}
