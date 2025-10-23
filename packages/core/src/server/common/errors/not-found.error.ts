import { ErrorCode } from '@longpoint/types';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';
import { createId } from '@paralleldrive/cuid2';
import { BaseError } from './base.error';
import { apiErrorDoc } from './error-doc';

export class ResourceNotFound extends BaseError {
  constructor(resource: string, value: string, uniqueField = 'id') {
    super(
      ErrorCode.RESOURCE_NOT_FOUND,
      `${resource} with ${uniqueField} ${value} not found`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class MediaContainerNotFound extends ResourceNotFound {
  constructor(id: string) {
    super('Media container', id, 'id');
  }
}
export const mediaContainerNotFoundDoc = apiErrorDoc(
  new MediaContainerNotFound(createId())
);
export const ApiMediaContainerNotFoundResponse = () => {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'Media container not found',
      ...mediaContainerNotFoundDoc,
    })
  );
};

export class ModelNotFound extends ResourceNotFound {
  constructor(id: string) {
    super('Model', id);
  }
}
export const modelNotFoundDoc = apiErrorDoc(new ModelNotFound(createId()));
export const ApiModelNotFoundResponse = () => {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'Model not found',
      ...modelNotFoundDoc,
    })
  );
};
