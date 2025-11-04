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

export class ModelOperationNotSupported extends BaseError {
  constructor(operation: string, modelId: string) {
    super(
      ErrorCode.OPERATION_NOT_SUPPORTED,
      `Operation '${operation}' is not supported for model '${modelId}'`,
      HttpStatus.BAD_REQUEST,
      { operation, modelId }
    );
  }
}
