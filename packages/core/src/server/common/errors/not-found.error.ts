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

export class MediaAssetNotFound extends ResourceNotFound {
  constructor(id: string) {
    super('Media asset', id, 'id');
  }
}
export const mediaAssetNotFoundDoc = apiErrorDoc(
  new MediaAssetNotFound(createId())
);
export const ApiMediaAssetNotFoundResponse = () => {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'Media asset not found',
      ...mediaAssetNotFoundDoc,
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

export class ClassifierNotFound extends ResourceNotFound {
  constructor(id: string) {
    super('Classifier', id);
  }
}
export const classifierNotFoundDoc = apiErrorDoc(
  new ClassifierNotFound('ukt4084q1kaqmsq74f2fxg43')
);
export const ApiClassifierNotFoundResponse = () =>
  applyDecorators(
    ApiNotFoundResponse({
      description: 'The classifier was not found',
      ...classifierNotFoundDoc,
    })
  );
