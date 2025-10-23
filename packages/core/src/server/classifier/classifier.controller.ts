import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiSdkTag } from '../common/decorators';
import { SdkTag } from '../common/types/swagger.types';
import { ClassifierService } from './classifier.service';
import { ClassifierDto } from './dtos/classifier.dto';
import { CreateClassifierDto } from './dtos/create-classifier.dto';

@Controller('ai/classifiers')
@ApiSdkTag(SdkTag.AI)
@ApiBearerAuth()
export class ClassifierController {
  constructor(private readonly classifierService: ClassifierService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a classifier',
    operationId: 'createClassifier',
  })
  @ApiCreatedResponse({ type: ClassifierDto })
  async createClassifier(@Body() body: CreateClassifierDto) {
    return this.classifierService.createClassifier(body);
  }
}
