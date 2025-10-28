import { Permission } from '@longpoint/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiSdkTag, RequirePermission } from '../common/decorators';
import { ApiClassifierNotFoundResponse } from '../common/errors';
import { SdkTag } from '../common/types/swagger.types';
import { ClassifierService } from './classifier.service';
import { ClassifierSummaryDto } from './dtos/classifier-summary.dto';
import { ClassifierDto } from './dtos/classifier.dto';
import { CreateClassifierDto } from './dtos/create-classifier.dto';
import { UpdateClassifierDto } from './dtos/update-classifier.dto';

@Controller('ai/classifiers')
@ApiSdkTag(SdkTag.AI)
@ApiBearerAuth()
export class ClassifierController {
  constructor(private readonly classifierService: ClassifierService) {}

  @Post()
  @RequirePermission(Permission.CLASSIFIER_CREATE)
  @ApiOperation({
    summary: 'Create a classifier',
    operationId: 'createClassifier',
  })
  @ApiCreatedResponse({ type: ClassifierDto })
  async createClassifier(@Body() body: CreateClassifierDto) {
    return this.classifierService.createClassifier(body);
  }

  @Get(':classifierId')
  @RequirePermission(Permission.CLASSIFIER_READ)
  @ApiOperation({
    summary: 'Get a classifier',
    operationId: 'getClassifier',
  })
  @ApiOkResponse({ type: ClassifierDto })
  @ApiClassifierNotFoundResponse()
  async getClassifier(@Param('classifierId') classifierId: string) {
    return this.classifierService.getClassifier(classifierId);
  }

  @Get()
  @RequirePermission(Permission.CLASSIFIER_READ)
  @ApiOperation({
    summary: 'List classifiers',
    operationId: 'listClassifiers',
  })
  @ApiOkResponse({ type: [ClassifierSummaryDto] })
  async listClassifiers() {
    return this.classifierService.listClassifiers();
  }

  @Patch(':classifierId')
  @RequirePermission(Permission.CLASSIFIER_UPDATE)
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

  @Delete(':classifierId')
  @RequirePermission(Permission.CLASSIFIER_DELETE)
  @ApiOperation({
    summary: 'Delete a classifier',
    operationId: 'deleteClassifier',
  })
  @ApiOkResponse({ description: 'The classifier was deleted' })
  @ApiClassifierNotFoundResponse()
  async deleteClassifier(@Param('classifierId') classifierId: string) {
    return this.classifierService.deleteClassifier(classifierId);
  }
}
