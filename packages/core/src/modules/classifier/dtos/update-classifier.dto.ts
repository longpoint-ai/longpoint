import { ApiSchema, PartialType } from '@nestjs/swagger';
import { CreateClassifierDto } from './create-classifier.dto';

@ApiSchema({ name: 'UpdateClassifier' })
export class UpdateClassifierDto extends PartialType(CreateClassifierDto) {}
