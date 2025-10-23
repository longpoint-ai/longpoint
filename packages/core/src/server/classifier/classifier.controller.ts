import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiSdkTag } from '../common/decorators';
import { SdkTag } from '../common/types/swagger.types';
import { ApiClassifierNotFoundResponse } from './classifier.errors';
import { ClassifierService } from './classifier.service';
import { ClassifierDto } from './dtos/classifier.dto';
import { CreateClassifierDto } from './dtos/create-classifier.dto';
import { UpdateClassifierDto } from './dtos/update-classifier.dto';

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

  @Patch(':classifierId')
  @ApiOperation({
    summary: 'Update a classifier',
    operationId: 'updateClassifier',
  })
  @ApiOkResponse({ type: ClassifierDto })
  @ApiClassifierNotFoundResponse()
  async updateClassifier(
    @Param('classifierId') classifierId: string,
    @Body() body: UpdateClassifierDto
  ) {
    return this.classifierService.updateClassifier(classifierId, body);
  }
}
