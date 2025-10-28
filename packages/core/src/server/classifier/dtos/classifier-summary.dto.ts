import { ModelSummaryDto } from '@/server/common/dtos/model/model-summary.dto';
import { ApiSchema, PickType } from '@nestjs/swagger';
import { ClassifierDto, ClassifierParams } from './classifier.dto';

export type ClassifierSummaryParams = Pick<
  ClassifierParams,
  'id' | 'name' | 'description' | 'createdAt' | 'updatedAt' | 'model'
>;

@ApiSchema({ name: 'ClassifierSummary' })
export class ClassifierSummaryDto extends PickType(ClassifierDto, [
  'id',
  'name',
  'description',
  'model',
  'createdAt',
  'updatedAt',
] as const) {
  constructor(data: ClassifierSummaryParams) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.model = new ModelSummaryDto(data.model);
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
