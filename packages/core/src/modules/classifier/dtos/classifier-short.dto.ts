import { ApiSchema, PickType } from '@nestjs/swagger';
import { ClassifierDto } from './classifier.dto';

export type ClassifierShortParams = Pick<
  ClassifierDto,
  'id' | 'name' | 'description'
>;

@ApiSchema({ name: 'ClassifierShort' })
export class ClassifierShortDto extends PickType(ClassifierDto, [
  'id',
  'name',
  'description',
] as const) {
  constructor(data: ClassifierShortParams) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
  }
}
