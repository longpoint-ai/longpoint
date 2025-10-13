import { applyDecorators } from '@nestjs/common';
import { ApiConflictResponse } from '@nestjs/swagger';
import { apiErrorDoc, ResourceAlreadyExists } from '../common/errors';

export class MediaContainerAlreadyExists extends ResourceAlreadyExists {
  constructor(name: string, path: string) {
    super(`Media container with name ${name} already exists at path ${path}`);
  }
}
export const mediaContainerExistsDoc = apiErrorDoc(
  new MediaContainerAlreadyExists('My Container', '/')
);
export const MediaContainerAlreadyExistsResponse = applyDecorators(
  ApiConflictResponse({
    description: 'The media container already exists',
    ...mediaContainerExistsDoc,
  })
);
