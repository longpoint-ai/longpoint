import { apiErrorDoc, BaseError, ResourceNotFound } from '@/shared/errors';
import { ErrorCode } from '@longpoint/types';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';

export class AiProviderNotFound extends ResourceNotFound {
  constructor(id: string) {
    super('AI provider', id);
  }
}
export const aiProviderNotFoundDoc = apiErrorDoc(
  new AiProviderNotFound('r2qwyd76nvd98cu6ewg8ync2')
);
export const ApiAiProviderNotFoundResponse = () => {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'AI provider not found',
      ...aiProviderNotFoundDoc,
    })
  );
};

export class ModelNotFound extends ResourceNotFound {
  constructor(id: string) {
    super('Model', id);
  }
}
export const modelNotFoundDoc = apiErrorDoc(
  new ModelNotFound('a9ri6j9r33yku4m8wrevlp29')
);
export const ApiModelNotFoundResponse = () => {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'Model not found',
      ...modelNotFoundDoc,
    })
  );
};

export class ClassifierNotSupported extends BaseError {
  constructor(modelId: string) {
    super(
      ErrorCode.OPERATION_NOT_SUPPORTED,
      `Classifier capabilities not supported for model '${modelId}'`,
      HttpStatus.BAD_REQUEST,
      { modelId }
    );
  }
}
